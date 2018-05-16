import React, { Component } from 'react';
import classnames from 'classnames';

import IconButton from 'core/IconButton';
import { Store } from '../../../store.js';
import SequenceStash from '../../../SequenceDriver/SequenceStash.js';
import st from './index.scss';


const PlayButton = ({ onClick }) =>
    <IconButton
        iconClass="far fa-play-circle"
        onClick={ onClick }
    />;
const StopButton = ({ onClick }) =>
    <IconButton
        iconClass="far fa-stop-circle"
        onClick={ onClick }
    />;
const ClearButton = ({ onClick }) =>
    <IconButton
        iconClass="far fa-times-circle"
        onClick={ onClick }
    />;
const RecordButton = ({ onClick }) =>
    <IconButton
        iconClass={ `fas fa-circle ${st.recIcon}` }
        onClick={ onClick }
    />;

export default class Hub extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: '',
        };
        this.watcherId = null;
    }

    componentDidMount() {
        this.setHubColor();
        this.watcherId = Store.addWatcher(this.setHubColor.bind(this));
    }

    componentWillUnmount() {
        Store.removeWatcher(this.watcherId);
    }

    setHubColor() {
        const { recorder, player } = this.props;
        const hubColors = {
            playing: 'green',
            recording: 'red',
            none: 'rgba(0, 0, 0, 0)',
        };
        let color = hubColors.none;
        if (recorder.recording) {
            color = hubColors.recording;
        } else if (player.playing) {
            color = hubColors.playing;
        }
        this.setState({ color });
    }

    render() {
        const { color } = this.state;
        const { SequenceDriver, recorder, player } = this.props;
        const hubContentStyle = {
            boxShadow: `inset 0px 0px 10px 0px ${color}`,
        };
        return (
            <div className={ st.Hub }>
                <div style={ hubContentStyle } className={ st.hubContent }>
                    <div className={ st.buttonContainer }>
                        <PlayButton onClick={ () => {
                            player.playback(SequenceStash.getMostRecent())
                        } } />
                        <StopButton onClick={ SequenceDriver.stop.bind(SequenceDriver) } />
                        <ClearButton onClick={ recorder.stopRecord.bind(recorder) } />
                        <RecordButton onClick={ recorder.record.bind(recorder) } />
                    </div>
                </div>
            </div>
        );
    }
};
