import { Store } from '../store.js';
import { GLOBAL_KEY } from 'utils/constants';

Store.loadState()

window.onload = () => {
    const hideEl = document.getElementById('hide');
    hideEl.onclick = hide;

    function hide() {
        Store.updateState(GLOBAL_KEY, {
            shown: false,
        });
    }

    const showEl = document.getElementById('show');
    showEl.onclick = show;

    function show() {
        Store.updateState(GLOBAL_KEY, {
            shown: true,
        });
    }
}
