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
        iconClass="far fa-times-circle"
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

export default class Hub extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: '',
            isStashShown: false,
            sq: null,
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

    handleSqSelect(sq) {
        console.log('Selecting Sequence:', sq)
        this.setState({ sq });
    }

    handleShowStashClick() {
        const { isStashShown } = this.state;
        this.setState({ isStashShown: !isStashShown });
    }

    render() {
        const { color, isStashShown } = this.state;
        const { SequenceDriver, recorder, player } = this.props;
        const hubContentStyle = {
            boxShadow: `inset 0px 0px 10px 0px ${color}`,
        };
        const stashClass = classnames(st.stashContainer, { [st.show]: isStashShown });
        return (
            <div className={ st.Hub }>
                <div style={ hubContentStyle } className={ st.hubContent }>
                    <div className={ st.buttonContainer }>
                        <PlayButton onClick={ () => {
                            const { sq } = this.state;
                            player.playback(sq)
                        } } />
                        <StopButton onClick={ SequenceDriver.stop.bind(SequenceDriver) } />
                        <ClearButton onClick={ recorder.stopRecord.bind(recorder) } />
                        <RecordButton onClick={ recorder.record.bind(recorder) } />
                        <ShowStash onClick={ this.handleShowStashClick.bind(this) } />
                        <div className={ stashClass }>
                            <Stash onSqSelect={ this.handleSqSelect.bind(this) } />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};
