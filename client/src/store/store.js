import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducers/reducer';
import middlewareAction from '../middleware/middleware';
import thunk from 'redux-thunk';

const store = createStore(reducer, applyMiddleware(middlewareAction,thunk));
export default store;

