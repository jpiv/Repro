import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import st from './index.scss';

export default class IconButton extends Component {
    static propTypes = {
        iconClass: PropTypes.string,
    };

    render() {
        const { iconClass, onClick } = this.props;
        return (
            <div onClick={ onClick } className={ st.IconButton }>
                <i className={ classnames(iconClass, st.icon) } />
            </div>
        );
    }
};
