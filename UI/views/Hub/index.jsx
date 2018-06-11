import React, { Component } from 'react';
import classnames from 'classnames';

import IconButton from 'core/IconButton';
import Stash from 'views/Stash';
import { Store } from '../../../store.js';
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
        iconClass="far fa-pause-circle"
        onClick={ onClick }
    />;
const RecordButton = ({ onClick }) =>
    <IconButton
        iconClass={ `fas fa-circle ${st.recIcon}` }
        onClick={ onClick }
    />;

const ShowStash = ({ onClick }) =>
    <IconButton
        iconClass={ `fas fa-angle-down` }
        onClick={ onClick }
    />;

const HideStash = ({ onClick }) =>
    <IconButton
        iconClass={ `fas fa-angle-up` }
        onClick={ onClick }
    />;

export default class Hub extends Component {
    constructor(props) {
        super(props);
        const { player } = props;
        this.state = {
            color: '',
            isControlTrayShown: false,
            sq: player.currentSequence || null,
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

    getStatus() {
        const { sq } = this.state;
        return sq ? sq.name : 'No sequence selected'
    }

    handleSqSelect(sq) {
        console.log('Selecting Sequence:', sq)
        this.setState({ sq });
    }

    handleToggleStashClick() {
        const { isControlTrayShown } = this.state;
        this.setState({ isControlTrayShown: !isControlTrayShown });
    }

    render() {
        const { color, isControlTrayShown } = this.state;
        const { SequenceDriver, recorder, player } = this.props;
        const hubContentStyle = {
            boxShadow: `inset 0px 0px 10px 0px ${color}`,
        };
        const controlTrayClass = classnames(st.controlTray, { [st.show]: isControlTrayShown });
        return (
            <div className={ st.Hub }>
                <div style={ hubContentStyle } className={ st.hubContent }>
                    <div className={ st.controlPanel }>
                        <div className={ st.statusDisplay }>
                            { this.getStatus() }
                        </div>
                        <div className={ st.buttonContainer }>
                            <PlayButton onClick={ () => {
                                const { sq } = this.state;
                                player.playback(sq)
                            } } />
                            <StopButton onClick={ SequenceDriver.stop.bind(SequenceDriver) } />
                            <ClearButton onClick={ recorder.stopRecord.bind(recorder) } />
                            <RecordButton onClick={ recorder.record.bind(recorder) } />
                            { isControlTrayShown ?
                                <HideStash onClick={ this.handleToggleStashClick.bind(this) } />
                                : <ShowStash onClick={ this.handleToggleStashClick.bind(this) } />
                            }
                        </div>
                        <div className={ controlTrayClass }>
                            <Stash onSqSelect={ this.handleSqSelect.bind(this) } />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
