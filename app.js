import React from 'react';
import ReactDom from 'react-dom';
import UI from './UI/index.jsx';
const SequenceDriver = require('./SequenceDriver/index.js');
const SequenceStash = require('./SequenceDriver/SequenceStash.js');

function boot() {
	const SD = new SequenceDriver();
	SD.boot().then(({ recorder, player }) => {
		const uiEl = document.createElement('div');
		uiEl.id = 'ui-main'
		// Browser compat
		document.body.prepend(uiEl);
        SequenceStash.load();
		ReactDom.render(<UI
			recorder={ recorder }
			player={ player }
            SequenceDriver={ SD }
		/>, uiEl);
	});
}

if (document.readyState === 'complete') {
	boot();
} else {
	document.onreadystatechange = () => {
		if (document.readyState === 'interactive' || document.readyState === 'complete') {
			boot();
		}
	};
}
