import uuid from 'uuid/v4';
import lzString from 'lz-string';

const SHARD_COUNT = 5

export const Store = {
	syncStorage: chrome.storage.sync,
	watchers: {},
	_state: {},	
	_updateQueue: [],
	_onSync: () => {},

	replaceState(newState) {
		return new Promise((resolve, reject) => {
			try {
				this.syncStorage.set({
					...this._compressState(newState)
				}, () => {
					this._state = newState;
					console.log('Saved state:', this._state);
					this.notifyWatchers();
					resolve(this._state);
				});
			} catch(err) {
				reject(err);
			}
		});
	},

	notifyWatchers() {
		this.loadState().then(() => {
			for(let watcherId in this.watchers) {
				this.watchers[watcherId](this._state);
			}
		})
	},

	addWatcher(watchFn) {
		const watcherId = uuid();
		this.watchers[watcherId] = watchFn;
		return watcherId;
	},

	removeWatcher(watcherId) {
		delete this.watchers[watcherId];
	},

	async clearState() {
		console.log('Clearing state...');
		return new Promise(resolve => this.syncStorage.clear(() => resolve()));
	},

	async getState(key) {
		if(this._updateQueue.length) {
			return await new Promise(resolve => {
				this._onSync = resolve.bind(this);
			});
		} else {
			return key ? this._state[key] || {} : this._state;
		}
	},

	async _drainUpdateQueue() {
		const update = this._updateQueue.shift();
		if(update && this._updateQueue.length) {
			this._state[update.key] = Object.assign(
				this._state[update.key] || {},
				update.updates
			)
			await this.replaceState(this._state);
			await this._drainUpdateQueue();
		} else if (update) {
			this._state[update.key] = Object.assign(
				this._state[update.key] || {},
				update.updates
			)
			await this.replaceState(this._state);
			this._onSync(this._state);
		}
		return this._state;
	},

	updateState(key, updates) {
		const update = { key, updates };
		if(!this._updateQueue.length) {
			this._updateQueue.push(update);
			return this._drainUpdateQueue();
		} else {
			this._updateQueue.push(update);
			return this.getState(key);
		}
	},

	loadState(key) {
		return new Promise((resolve, reject) => {
			try {
				this.syncStorage.get(null, payload => {
					this._state = this._decompressState(payload || {});
					console.log('Loaded state:', this._state);
					if(key) resolve(this._state[key] || {});
					else resolve(this._state);
				});
			} catch(err) {
				reject(err);
			}
		});
	},

	_getShardId(key, shardIndex) {
		return `$!${key}S${shardIndex}`
	},

	_isShardId(key) {
		return key.substr(0, 2) === '$!'
	},

	_compressState(state) {
		const compressedState = {};
		for(let key in state) {
			const shards = [];
			const compressedItem = lzString.compressToUTF16(JSON.stringify(state[key]));
			const shardSize = Math.ceil(compressedItem.length / SHARD_COUNT);
			for(let i = 0; i < SHARD_COUNT; i ++) {
				const shard = compressedItem.substr(i * shardSize, shardSize)
				const shardId = this._getShardId(key, i)
				compressedState[shardId] = shard
				shards.push(shardId)
			}
			compressedState[key] = { shards }
		}
		return compressedState;
	},

	_decompressState(state) {
		const decompressedState = {};
		for(let key in state) {
			if (!this._isShardId(key)) {
				const shards = state[key].shards;
				const reconstructedShard = JSON.parse(
					lzString.decompressFromUTF16(
						shards.map(shardId => state[shardId]).join('')
					)
				)
				decompressedState[key] = reconstructedShard
			}
		}
		return decompressedState
	}
};

chrome.storage.onChanged.addListener(Store.notifyWatchers.bind(Store))
