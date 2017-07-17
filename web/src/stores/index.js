import { createStore, combineReducers, applyMiddleware } from 'redux'
import reducers from '../reducers';
import { middlewares } from '../middlewares';
import thunk from 'redux-thunk';
module.exports = function(initialState) {

//const store = createStore(reducers, initialState);
const store = applyMiddleware(middlewares.logMiddleware,thunk)(createStore);
//const store = applyMiddleware(thunkMiddleware)(createStore(reducers, initialState));


  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers')
      store.replaceReducer(nextReducer)
    })
  }
  return store(reducers, initialState)
}
