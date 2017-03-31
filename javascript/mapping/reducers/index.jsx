import {combineReducers} from 'redux';
import addresses from './addresses';

const combined = combineReducers({
    addresses
});

export {create_address} from './addresses';
export default combined;
