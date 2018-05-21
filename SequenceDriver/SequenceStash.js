import uuid from 'uuid/v1';

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

    async add(sequence) {
        const key = uuid();
        Store.updateState(key, { sequence });
        this.ids.push(key);
        Store.updateState(IDS_KEY, { ids: this.ids });
        this.sequences[key] = sequence;
    },

    getMostRecent() {
        const sqKeys = Object.keys(this.sequences);
        return this.sequences[sqKeys[sqKeys.length - 1]]; 
    }
};

module.exports = SequenceStash;
