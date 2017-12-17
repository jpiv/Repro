import React from 'react';
import ReactDom from 'react-dom';
import UI from './UI/index.jsx';
const SequenceDriver = require('./SequenceDriver/index.js');

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
	const SR = new SequenceDriver();
	SR.boot().then(({ recorder, player }) => {
		addButton(20, 20, () => {
			player.playback(recorder.currentSequence);
		}, 'Playback');
		// Clear playback too
		addButton(20, 60, recorder.clearRecord.bind(recorder), 'Clear');
		addButton(20, 100, recorder.record.bind(recorder), 'Record');
		addButton(20, 140, recorder.stopRecord.bind(recorder), 'Stop');
		const uiEl = document.createElement('div');
		uiEl.id = 'ui-main'
		// Browser compat
		document.body.prepend(uiEl);
		ReactDom.render(<UI />, uiEl);
	});
}
window.onload = boot;
