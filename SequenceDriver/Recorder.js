const _debounce = require('lodash.debounce');
const { Store } = require('../store.js');
const Sequence = require('./Sequence.js');
const SequenceStash = require('./SequenceStash.js');

const RECORDER_KEY = 'recorder';

module.exports = class Recorder {
	constructor(DOMRefresh) {
		this.recording = false;
		this.outdated = false;
		this.pause = 0;
		this.pauseTimer = null;
		this.currentSequence = null;
		this.DOMRefresh = DOMRefresh;
		this.handleChange = _debounce(this.eventFired.bind(this), 100)
		this.handleClick = _debounce(this.eventFired.bind(this), 100)
		this.handleClick2 = _debounce(this.eventFired.bind(this), 100)
		this.handleClick3 = _debounce(this.eventFired.bind(this), 100)
		this.handleMouseOver = _debounce(this.eventFired.bind(this), 100)
		this.handleMouseOver2 = _debounce(this.eventFired.bind(this), 100)
		this.handleFocus = _debounce(this.eventFired.bind(this), 100)
		this.handleFocus2 = _debounce(this.eventFired.bind(this), 100)
		this.handleKeyPress = _debounce(this.eventFired.bind(this), 100)
		this.handleKeyPress2 = _debounce(this.eventFired.bind(this), 100)
	}

	record() {
		console.log('Recording...');
		this.puase = 0;
		this.pauseTimer = setInterval(() => {
			this.pause += 10;
		}, 10);
		this.recording = true;
		this.currentSequence = this.currentSequence || new Sequence(null, window.location);
		Store.updateState(RECORDER_KEY, { recording: true });
	}

	mutationHandler(mutation) {
		this.outdated = true;
	}

	DOMRefreshHook(el) {
		el.removeEventListener('mouseover', this.handleMouseOver);
		el.addEventListener('mouseover', this.handleMouseOver);
		el.removeEventListener('mouseout', this.handleMouseOver2);
		el.addEventListener('mouseout', this.handleMouseOver2);

		el.removeEventListener('mousedown', this.handleClick);
		el.addEventListener('mousedown', this.handleClick);

		el.removeEventListener('mouseup', this.handleClick2);
		el.addEventListener('mouseup', this.handleClick2);

		el.removeEventListener('click', this.handleClick3);
		el.addEventListener('click', this.handleClick3);

		el.removeEventListener('focus', this.handleFocus);
		el.addEventListener('focus', this.handleFocus);
		el.removeEventListener('blur', this.handleFocus2);
		el.addEventListener('blur', this.handleFocus2);

		el.removeEventListener('change', this.handleChange);
		el.addEventListener('change', this.handleChange);


		el.removeEventListener('keydown', this.handleKeyPress);
		el.addEventListener('keydown', this.handleKeyPress);
		el.removeEventListener('keyup', this.handleKeyPress2);
		el.addEventListener('keyup', this.handleKeyPress2);
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

	async stopRecord() {
		this.recording = false;
		this.pauseTimer && clearInterval(this.pauseTimer);
		this.pause = 0;
		this.currentSequence && await SequenceStash.add(this.currentSequence);
		console.log('Stopped recording');
		this.currentSequence = null;
		await Store.updateState(RECORDER_KEY, {
			currentSequence: this.currentSequence,
			recording: false,
		});
	}

	recordAction(e) {
		if(!e.target.matches('div#ui-main *')) {
			const action = this.currentSequence.addAction(e, this.pause);
			Store.updateState(RECORDER_KEY, { currentSequence: this.currentSequence });
			this.pause = 0;
			if(this.outdated) {
				// TODO: Cancel pending call from debounce
				// this.DOMRefresh();
			}
			console.log('Action Performed:', e.target, action);
		}
	}

	eventFired(e) {
		if(!e.target.noRecord && this.recording) {
			this.recordAction(e);
		}	
	}
};
