const _debounce = require('lodash.debounce');
const { Store } = require('./store.js');
const Sequence = require('./Sequence.js');

const RECORDER_KEY = 'recorder';

module.exports = class Recorder {
	constructor(DOMRefresh) {
		this.recording = false;
		this.outdated = false;
		this.pause = 0;
		this.pauseTimer = null;
		this.currentSequence = new Sequence();
		this.DOMRefresh = DOMRefresh;
		this.handleChange = _debounce(this.eventFired.bind(this), 100)
		this.handleClick = _debounce(this.eventFired.bind(this), 100)
	}

	record() {
		console.log('Recording...');
		this.puase = 0;
		this.pauseTimer = setInterval(() => {
			this.pause += 100;
		}, 100);
		this.recording = true;
		Store.updateState(RECORDER_KEY, { recording: true });
	}

	mutationHandler(mutation) {
		if(mutation.attributeName === 'class') {
			this.outdated = true;
		}
	}

	DOMRefreshHook(el) {
		el.removeEventListener('click', this.handleClick);
		el.addEventListener('click', this.handleClick);

		el.removeEventListener('change', this.handleChange);
		el.addEventListener('change', this.handleChange);
	}

	async boot() {
		const {
			currentSequence,
			recording
		} = await Store.loadState(RECORDER_KEY);
		if(currentSequence)
			this.currentSequence = new Sequence(currentSequence);
		if (recording) this.record();
	}

	start() {
		if (this.recording) this.record();
	}

	stopRecord() {
		this.recording = false;
		this.pauseTimer && clearInterval(this.pauseTimer);
		this.pause = 0;
		Store.updateState(RECORDER_KEY, { recording: false, currentSequence: this.currentSequence });
		console.log('Stopped recording');
	}

	clearRecord() {
		this.stopRecord();
		this.currentSequence = new Sequence();
		Store.updateState(RECORDER_KEY, {
			currentSequence: this.currentSequence,
			recording: false,
		});
	}

	recordAction(e) {
		const action = this.currentSequence.addAction(e, this.pause);
		Store.updateState(RECORDER_KEY, { currentSequence: this.currentSequence });
		this.pause = 0;
		if(this.outdated) {
			// TODO: Cancel pending call from debounce
			this.DOMRefresh();
		}
		console.log('Action Performed:', e.target, action);
	}

	eventFired(e) {
		if(!e.target.noRecord && this.recording) {
			this.recordAction(e);
		}	
	}
};
