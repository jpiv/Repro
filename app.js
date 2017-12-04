const _debounce = require('lodash.debounce');
const { Store } = require('./store.js');

let actions = [];
let pauseTimer = null;
let pause = 0;
let recording = false;
let isPlayingBack = null;

function record() {
	console.log('Recording...');
	puase = 0;
	pauseTimer = setInterval(() => {
		pause += 100;
	}, 100);
	recording = true;
	Store.updateState({ recording: true });
}

function getSelectorFromEl(baseEl) {
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

let outdated = false;
function recordAction(e) {
	const { selector, selectorIndex, value } = e.target;
	console.log('Selector:', selector, selectorIndex);
	const action = {
		type: e.type,
		options: {
			bubbles: e.bubbles,
			composed: e.composed,
			cancelable: e.cancelable,
		},
		target: selector,
		value: value,
		selectorIndex: selectorIndex,
		pause: pause,
	};
	actions.push(action);
	Store.updateState({ actions: actions });
	pause = 0;
	if(outdated) {
		// TODO: Cancel pending call from debounce
		_addListeners();
	}
	console.log('Action Performed:', e.target, action);
}

function stopRecord() {
	recording = false;
	pauseTimer && clearInterval(pauseTimer);
	pause = 0;
	Store.updateState({ recording: false });
	console.log('Stopped recording');
}

async function playback() {
	console.log('Playing back...');
	stopRecord();
	const state = (await Store.getState());
	const storedActions = state.actions;
	let actionIndex = state.playback
		? state.playback.actionIndex : 0;
	const performAction = action => {
		setTimeout(() => {
			const target = document.querySelectorAll(action.target)[action.selectorIndex];
			console.log(action)
			console.log('Clicking:', target);
			actionIndex++;
			Store.updateState({
				playback: {
					actionIndex: actionIndex
				}
			});
			target.value = action.value
			const EventConstructor = action.type === 'click'
				? MouseEvent : Event;
			target.dispatchEvent(
				new EventConstructor(action.type, action.options));
			if(actionIndex < storedActions.length)
				performAction(storedActions[actionIndex]);
			else
				Store.updateState({ playback: null });
		}, action.pause);
	};
	storedActions.length && performAction(storedActions[actionIndex]);
}

function clickFired(e) {
	if(!e.target.noRecord && recording) {
		recordAction(e);
	}
}

const onClickHandler = _debounce(clickFired, 100);
const onClickHandler2 = _debounce(clickFired, 100);
const onClickHandler3 = _debounce(clickFired, 100);
function _addListeners() {
	const els = document.querySelectorAll('*');
	const elCounts = {};
	els.forEach(el => {
		const selector = getSelectorFromEl(el);
		el.selector = selector;
		elCounts[selector] = elCounts.hasOwnProperty(selector)
			? elCounts[selector] + 1: 0;
		el.selectorIndex = elCounts[selector];
		el.removeEventListener('click', onClickHandler);
		el.addEventListener('click', onClickHandler);

		el.removeEventListener('change', onClickHandler3);
		el.addEventListener('change', onClickHandler3);
	});
	console.log('Listeners addeed:', els.length);
}
const addListeners = _debounce(_addListeners, 250);

function createObserver() {
	let observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			if(mutation.attributeName === 'class') {
				addListeners();
				outdated = true;
			}
		});
	});
	observer.observe(document, {childList: true, attributes: true, subtree: true});
}

function start() {
	_addListeners();
	createObserver();
	if(isPlayingBack) {
		playback();
	} else if (recording) {
		record();
	}
}

function addButton(x, y, onclick, title) {
	const button = document.createElement('button');
	button.style.position = 'fixed';
	button.style.left = `${x}px`;
	button.style.top = `${y}px`;
	button.style.width = '90px';
	button.style.height = '30px';
	button.style.zIndex = '9999';
	button.style.cursor = 'pointer';
	button.noRecord = true;
	button.innerHTML = title;
	button.onclick = onclick;
	document.body.appendChild(button);
}

function boot() {
	addButton(20, 20, playback, 'Playback');
	addButton(20, 60, () => {
		stopRecord();
		actions = [];
		Store.updateState({ actions: [], playback: null, recording: false });
	}, 'Clear');
	addButton(20, 100, record, 'Record');
	addButton(20, 140, stopRecord, 'Stop');
	Store.loadState().then(state => {
		actions = state.actions;
		isPlayingBack = state.playback;
		recording = state.recording;
		start();
	});
}
window.onload = boot;
