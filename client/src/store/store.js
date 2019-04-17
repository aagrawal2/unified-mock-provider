import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducers/reducer';
import middlewareAction from '../middleware/middleware';

const store = createStore(reducer, applyMiddleware(middlewareAction));
export default store;

