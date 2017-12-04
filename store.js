export const Store = {
	syncStorage: chrome.storage.sync,
	_state: {},	
	_updateQueue: [],
	_onSync: () => {},

	replaceState(newState) {
		return new Promise((resolve, reject) => {
			try {
				this.syncStorage.set({
					state: newState
				}, () => {
					this._state = newState;
					console.log('Saved state:', this._state);
					resolve(this._state);
				});
			} catch(err) {
				reject(err);
			}
		});
	},

	async clearState() {
		console.log('Clearing state...');
		return await this.replaceState({});
	},

	async getState() {
		if(this._updateQueue.length) {
			console.log('here')
			return await new Promise(resolve => {
				this._onSync = resolve.bind(this);
			});
		} else {
			return this._state;
		}
	},

	async _drainUpdateQueue() {
		const update = this._updateQueue.shift();
		if(update && this._updateQueue.length) {
			await this.replaceState(
				Object.assign(this._state, update)
			);
			await this._drainUpdateQueue();
		} else if (update) {
			await this.replaceState(
				Object.assign(this._state, update)
			);
			this._onSync(this._state);
		}
		return this._state;
	},

	updateState(updates) {
		if(!this._updateQueue.length) {
			this._updateQueue.push(updates);
			this._drainUpdateQueue();
		} else {
			this._updateQueue.push(updates);
		}
	},

	loadState() {
		return new Promise((resolve, reject) => {
			try {
				this.syncStorage.get('state', payload => {
					this._state = payload.state;
					console.log('Loaded state:', this._state);
					resolve(this._state);
				});
			} catch(err) {
				reject(err);
			}
		});
	}
};
