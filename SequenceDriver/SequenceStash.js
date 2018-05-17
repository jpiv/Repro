import Sequence from './Sequence.js';
import { Store } from '../store.js';

const IDS_KEY = 'sequenceIds';

const SequenceStash = {
    ids: [],
    sequences: {},

    async _getIds() {
        return (await Store.getState(IDS_KEY)).ids || [];
    },

    async load() {
        this.ids = await this._getIds();
        for (let id of this.ids) {
            this.sequences[id] = new Sequence((await Store.getState(id)).sequence);
        }
    },

    add(sequence) {
        if (this.sequences[sequence.id]) {
            sequence.id += '(Copy)';
        }
        Store.updateState(sequence.id, { sequence });
        this.ids.push(sequence.id);
        Store.updateState(IDS_KEY, { ids: this.ids });
        this.sequences[sequence.id] = sequence;
    },

    getMostRecent() {
        const sqKeys = Object.keys(this.sequences);
        return this.sequences[sqKeys[sqKeys.length - 1]]; 
    }
};

module.exports = SequenceStash;
