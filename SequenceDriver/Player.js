const Sequence = require('./Sequence.js');
const { Store } = require('../store.js');

const PLAYER_KEY = 'player';

module.exports = class Player {
	constructor() {
		this.playing = false;
		this.currentSequence = new Sequence();
	}

	start() {
		this.playing && this.playback();
	}

	async boot() {
		const {
			playing,
			currentSequence
		} = await Store.loadState(PLAYER_KEY);
		this.playing = playing;
		if(currentSequence)
			this.currentSequence = new Sequence(currentSequence);
	}

	async playback(sequence) {
		console.log('Playing back...');
		let actionIndex = 0;
		let storedActions = sequence && sequence.actions;
		if(!this.playing) {
			Store.updateState(PLAYER_KEY, { currentSequence: sequence });
		} else {
			const {
				actionIndex: index,
				currentSequence
			} = await Store.getState(PLAYER_KEY);
			storedActions = currentSequence.actions;
			actionIndex = index;
		}
		this.playing = true; 
		await Store.updateState(PLAYER_KEY, { playing: true });
		const performAction = action => {
			setTimeout(() => {
				const target = document.querySelectorAll(action.target)[action.selectorIndex];
				console.log(action)
				console.log('Clicking:', target);
				actionIndex++;
				Store.updateState(PLAYER_KEY, {
					actionIndex: actionIndex,
				});
				target.value = action.value
				const EventConstructor = action.type === 'click'
					? MouseEvent : Event;
				target.dispatchEvent(
					new EventConstructor(action.type, action.options));
				if(actionIndex < storedActions.length) {
					performAction(storedActions[actionIndex]);
				} else {
					this.playing = false;
					Store.updateState(
						PLAYER_KEY,
						{ playing: false }
					);
				}
			}, action.pause);
		};
		storedActions.length && performAction(storedActions[actionIndex]);
	}
};
