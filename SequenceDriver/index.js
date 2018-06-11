const _debounce = require('lodash.debounce');
const { Store } = require('../store.js');
const Recorder = require('./Recorder.js');
const Player = require('./Player.js');

module.exports = class SequenceDriver {
	constructor() {
		this.recorder = new Recorder(this.addListeners.bind(this));
		this.player = new Player();
		this.currentPlayback = null;
	}

	addListeners(els) {
		els.forEach(el => this.addListener.bind(this));
		console.log('Listeners addeed:', els.length);
	}

	addListener(el) {
		if(el.nodeName.charAt(0) !== '#') {
			const selector = this.enrichEl(el);
			this.recorder.DOMRefreshHook(el);
		}
	}

	start() {
		const allEls = document.querySelectorAll('*');
		this.addListeners(allEls);
		this.createObserver();
		this.recorder.start();
		this.player.start();
	}

	stop() {
		this.recorder.stopRecord();	
		this.player.stopPlaying();
	}

	createObserver() {
		let observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				this.addListener(mutation.target);
				if (mutation.addedNodes && mutation.addedNodes.length) {
					mutation.addedNodes.forEach(node => {
						if(node.nodeName.charAt(0) !== '#') {
							this.addListener(node)
							const childNodes = node.querySelectorAll('*')
							this.addListeners(childNodes)
						}
					})
				}
			});
		});
		observer.observe(document, { childList: true, attributes: true, subtree: true });
	}

	enrichEl(baseEl) {
		const createSelectorString = el	=> {
			if(el !== document) {
				let selector = el.tagName.toLowerCase();
				if(el.classList.length) {
					selector +=	`.${Array.from(el.classList).join('.')}`;
					selector = selector.replace(':', '\\:');
				}
				return selector;
			}
		}
		const baseSelector = createSelectorString(baseEl);
		// Primary identifiers
		const type = baseEl.tagName.toLowerCase();
		// Parent selector
		const parentSelector = baseEl.parentNode
			&& `${createSelectorString(baseEl.parentNode)}>${baseSelector}`;
		// Grand parent selector
		const grandParentSelector = baseEl.parentNode && baseEl.parentNode.parentNode
			&& `${createSelectorString(baseEl.parentNode.parentNode)}>${parentSelector}`;
		// Attribute list
		const attrs = Array.from(baseEl.attributes, ({ name, value }) => ({ name, value }));

		// Secondary identifiers
		const text = baseEl.textContent;

		baseEl.identifiers = {
			type,
			parentSelector,
			grandParentSelector,
			attrs,
			text,
		};
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
