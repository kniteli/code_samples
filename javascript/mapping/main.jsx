import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducers from 'reducers';
import App from './app';
import {load_addresses} from 'actions';

export const main = () => {
    let store = createStore(reducers, applyMiddleware(thunk));
    store.dispatch(load_addresses());
    render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('approot')
    );
}

main();
