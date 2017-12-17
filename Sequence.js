module.exports = class Sequence {
	constructor(rawSequence) {
		rawSequence = rawSequence || {};
		this.actions = rawSequence.actions || [];
		if(rawSequence.locked) {
			this.lock();
		}
	}

	lock() {
		Object.defineProperty(this, 'locked', {
			writable: false,
			value: true,
		});
	}

	isLocked() {
		if (this.locked)
			console.log('Sequence is locked.')
	}

	addAction(e, pause) {
		if (this.isLocked()) return;
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
			pause,
		};
		this.actions.push(action);
		return action;
	}
}
