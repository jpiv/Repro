import React, { Component } from 'react';
import classnames from 'classnames';
import 'babel-polyfill';

import Hub from './views/Hub';
import '../fontawesome-all.min.js';
import st from './index.scss';

export default class UI extends Component {
	render() {
		return (
			<div className={ classnames(st.UI, st.container) }>
                <Hub />
			</div>
		);
	}
};
