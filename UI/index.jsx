import React, { Component } from 'react';
import classnames from 'classnames';
import 'babel-polyfill';

import Hub from './views/Hub';
import { Store } from '../store.js';
import { GLOBAL_KEY } from 'utils/constants';
import '../fontawesome-all.min.js';
import st from './index.scss';

export default class UI extends Component {
    constructor(props) {
        super(props);
        this.state = { shown: true };
        this.watcherId = null;
    }

    componentWillMount() {
        this.watcherId = Store.addWatcher(state => {
            this.setState({ shown:  state.global && state.global.shown });
        });
        Store.getState(GLOBAL_KEY).then(state =>
            this.setState({ shown: state.shown }));
    }

    componentWillUnmount() {
        Store.removeWatcher(this.watcherId);
    }

	render() {
        const { shown } = this.state;
		const { recorder, player, SequenceDriver } = this.props;

        if (!shown) return null;

		return (
			<div className={ classnames(st.UI, st.container) }>
                <Hub SequenceDriver={ SequenceDriver } recorder={ recorder } player={ player } />
			</div>
		);
	}
};
