import React, { Component } from 'react';
import classnames from 'classnames';

import IconButton from 'core/IconButton';
import st from './index.scss';


const PlayButton = onClick =>
    <IconButton
        iconClass="far fa-play-circle"
        onClick={ onClick }
    />;
const StopButton = onClick =>
    <IconButton
        iconClass="far fa-stop-circle"
        onClick={ onClick }
    />;
const ClearButton = onClick =>
    <IconButton
        iconClass="far fa-times-circle"
        onClick={ onClick }
    />;
const RecordButton = onClick =>
    <IconButton
        iconClass="fas fa-circle"
        onClick={ onClick }
    />;

export default class Hub extends Component {
    render() {
        return (
            <div className={ st.Hub }>
                <PlayButton />
                <StopButton />
                <ClearButton />
                <RecordButton />
            </div>
        );
    }
};
