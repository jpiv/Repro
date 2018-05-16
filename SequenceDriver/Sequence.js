module.exports = class Sequence {
	constructor(rawSequence) {
		rawSequence = rawSequence || {};
		this.actions = rawSequence.actions || [];
		this.id = rawSequence.id || new Date().toISOString()
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
		const { identifiers, value } = e.target;
		console.log('Identifiers:', identifiers);
		const action = {
			type: e.type,
			options: {
				bubbles: e.bubbles,
				composed: e.composed,
				cancelable: e.cancelable,
			},
			value: value,
			identifiers,
			pause,
		};
		this.actions.push(action);
		return action;
	}
}
