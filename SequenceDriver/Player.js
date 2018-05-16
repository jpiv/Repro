const Sequence = require('./Sequence.js');
const { Store } = require('../store.js');
const uuid = require('uuid/v1');

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

	getElement(identifiers) {
		const { attrs, type, text, parentSelector, grandParentSelector } = identifiers;
		const elCandidates = [];
		// Primary Filtering
		// Greatest # of matching queries on one element
		let maxCount = 0;
		const addElCs = els => {
			els.forEach(el => {
				const existingElC = elCandidates.find(elC => elC.el === el);
				if (existingElC) {
					existingElC.count++;
					if(existingElC.count > maxCount) {
						maxCount = existingElC.count;
					}
				} else {
					elCandidates.push({ el, count: 0 });
				}
			});
		};
		attrs.forEach(attr => {
			// Search for all elements with matchin attributes
			const els = document.querySelectorAll(`${type}[${attr.name}='${attr.value}']`);
			// Count # of times each element matches an attribute selector
			addElCs(els);
		});
		const parentEls = document.querySelectorAll(parentSelector);
		addElCs(parentEls);
		const gParentEls = document.querySelectorAll(grandParentSelector);
		addElCs(gParentEls);
		// TODO: Use parent/gparent selectors for better filtering
		console.log('Candidates:', elCandidates);
		// Find matching elements
		const matchedElCs = elCandidates.filter(elC => elC.count >= maxCount);
		if (matchedElCs.length === 1) {
			console.log('Matched element:', matchedElCs[0])
			return matchedElCs[0].el;
		} else {
			// Secondary Filtering
			const finalElC = matchedElCs.find(elC => elC.el.textContent === text);
			// TODO: Find a way to use selector index if there is still a tie
			// TODO: If text has changed and no match is found, need a fallback to decide
			// (Wikipedia test case)
			console.log(`Conflict, text match on, "${text}" choosing: ${finalElC}`);
			return finalElC.el;
		}
	}

	async stopPlaying() {
		this.playing = false;
		await Store.updateState(
			PLAYER_KEY,
			{
				playing: false,
				actionIndex: 0,
			}
		);
		console.log('Stopped Playing');
	}

	async playback(sequence) {
		console.log(sequence)
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
			this.playing && setTimeout(() => {
				console.log(action)
				const target = this.getElement(action.identifiers);
				console.log(action)
				console.log('Clicking:', target);
				actionIndex++;
				Store.updateState(PLAYER_KEY, {
					actionIndex: actionIndex,
				});
				target.value = action.value
				const EventConstructor = action.type === 'mousedown'
					? MouseEvent : Event;
				target.dispatchEvent(
					new EventConstructor('click', action.options));
				if(actionIndex < storedActions.length) {
					performAction(storedActions[actionIndex]);
				} else {
					this.stopPlaying();
				}
			}, action.pause);
		};
		storedActions.length && performAction(storedActions[actionIndex]);
	}
};
