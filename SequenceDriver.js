const _debounce = require('lodash.debounce');
const { Store } = require('./store.js');
const Recorder = require('./Recorder.js');
const Player = require('./Player.js');

module.exports = class SequenceDriver {
	constructor() {
		this.recorder = new Recorder(this._addListeners.bind(this));
		this.player = new Player();
		this.currentPlayback = null;
		this.addListeners = _debounce(this._addListeners.bind(this), 250);
	}

	_addListeners() {
		const els = document.querySelectorAll('*');
		const elCounts = {};
		els.forEach(el => {
			const selector = this.getSelectorFromEl(el);
			el.selector = selector;
			elCounts[selector] = elCounts.hasOwnProperty(selector)
				? elCounts[selector] + 1: 0;
			el.selectorIndex = elCounts[selector];
			this.recorder.DOMRefreshHook(el);
		});
		console.log('Listeners addeed:', els.length);
	}

	start() {
		this._addListeners();
		this.createObserver();
		this.recorder.start();
		this.player.start();
	}

	createObserver() {
		let observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if(mutation.attributeName === 'class') {
					this.addListeners();
				}
				this.recorder.mutationHandler(mutation);
			});
		});
		observer.observe(document, {childList: true, attributes: true, subtree: true});
	}

	getSelectorFromEl(baseEl) {
		const createSelectorString = el	=> {
			if(el !== document) {
				let selector = el.tagName.toLowerCase();
				if(el.id) {
					// selector +=`#${el.id}`;
				}
				if(el.className && typeof el.className === 'string') {
					selector +=`[class='${el.className}']`;
				}
				return selector;
			}
		}
		const grandParentSelector = baseEl.parentNode.parentNode
			&& createSelectorString(baseEl.parentNode.parentNode);
		const parentSelector = baseEl.parentNode
			&& createSelectorString(baseEl.parentNode);
		const baseSelector = createSelectorString(baseEl);
		return [
			grandParentSelector,
			parentSelector,
			baseSelector
		].filter(node => !!node).join('>');
	}

	async boot() {
		// await Store.clearState();
		await this.recorder.boot();
		await this.player.boot();
		this.start();
		return {
			recorder: this.recorder,
			player: this.player,
		};
	}
}
