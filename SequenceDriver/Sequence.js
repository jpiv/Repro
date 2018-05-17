module.exports = class Sequence {
	constructor(rawSequence, host) {
		rawSequence = rawSequence || {};
		this.actions = rawSequence.actions || [];
		this.id = rawSequence.id || this.createId(host);
		if(rawSequence.locked) {
			this.lock();
		}
	}

	createId(host='') {
		const now = new Date();
		const nowString = now.toISOString().split('T')[0];
		return `${host}_${nowString}`;
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
