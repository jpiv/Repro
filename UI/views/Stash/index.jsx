import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import SequenceStash from 'SD/SequenceStash.js';
import SequenceDetails from 'views/SequenceDetails'
import st from './index.scss';

export default class Stash extends Component {
    static propTypes = { onSqSelect: PropTypes.func };

    constructor(props) {
        super(props)
        this.state = {
            showDetails: '',
        }
    }

    handleSqSelect(id) {
        const { onSqSelect } = this.props;
        const sq = SequenceStash.sequences[id];
        onSqSelect(sq);
    }

    handleSqDetailsClick(id) {
        this.setState({ showDetails: id })
    }

    renderSequenceList() {
        return SequenceStash.ids.map(id =>
            <div
                key={ id }
                className={ st.sequence }>
                <div
                    className={ st.sequenceName }
                    onClick={ this.handleSqSelect.bind(this, id) }>
                    { SequenceStash.sequences[id].name }
                </div>
                <div className={ st.sequenceDetails } onClick={ this.handleSqDetailsClick.bind(this, id) }>
                    <i className={
                        classnames(
                            st.detailsIcon,
                            'fas',
                            'fa-angle-right',
                        )
                    } />
                </div>
            </div>
        );
    }

    renderSequenceDetails() {
        const { showDetails } = this.state
        return <SequenceDetails id={ showDetails } />
    }

    render() {
        const { showDetails } = this.state
        const renderDetails = showDetails && SequenceStash.sequences[showDetails]
        return (
            <div className={ st.Stash }>
                { renderDetails ? this.renderSequenceDetails() : this.renderSequenceList() }
            </div>
        );
    }
}
