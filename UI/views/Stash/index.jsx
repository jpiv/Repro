import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SequenceStash from 'SD/SequenceStash.js';
import st from './index.scss';

export default class Stash extends Component {
    static propTypes = { onSqSelect: PropTypes.func };

    handleSqSelect(id) {
        const { onSqSelect } = this.props;
        const sq = SequenceStash.sequences[id];
        onSqSelect(sq);
    }

    renderSequenceList() {
        return SequenceStash.ids.map(id =>
            <div
                key={ id }
                className={ st.sequence }
                onClick={ this.handleSqSelect.bind(this, id) }>
                { SequenceStash.sequences[id].name }
            </div>
        );
    }

    render() {
        return (
            <div className={ st.Stash }>
                { this.renderSequenceList() }
            </div>
        );
    }
}
