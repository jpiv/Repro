import uuid from 'uuid/v4';

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
					...newState
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
			this._drainUpdateQueue();
		} else {
			this._updateQueue.push(update);
		}
	},

	loadState(key) {
		return new Promise((resolve, reject) => {
			try {
				this.syncStorage.get(null, payload => {
					this._state = payload || {};
					console.log('Loaded state:', this._state);
					if(key) resolve(this._state[key] || {});
					else resolve(this._state);
				});
			} catch(err) {
				reject(err);
			}
		});
	}
};

chrome.storage.onChanged.addListener(Store.notifyWatchers.bind(Store))
