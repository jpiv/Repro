import Sequence from './Sequence.js';
import { Store } from '../store.js';

const IDS_KEY = 'sequenceIds';

const SequenceStash = {
    _ids: [],
    sequences: {},

    async _getIds() {
        return (await Store.getState(IDS_KEY)).ids || [];
    },

    async load() {
        this._ids = await this._getIds();
        for (let id of this._ids) {
            this.sequences[id] = new Sequence((await Store.getState(id)).sequence);
        }
    },

    add(sequence) {
        Store.updateState(sequence.id, { sequence });
        this._ids.push(sequence.id);
        Store.updateState(IDS_KEY, { ids: this._ids });
        this.sequences[sequence.id] = sequence;
    },

    getMostRecent() {
        const sqKeys = Object.keys(this.sequences);
        return this.sequences[sqKeys[sqKeys.length - 1]]; 
    }
};

module.exports = SequenceStash;
