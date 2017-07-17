/* Populated by react-webpack-redux:action */
// Just for your curiosity, here is how a middleware to log all actions that are dispatched, would
// look like:

 var logMiddleware = function ({ dispatch, getState }) {
    return function(next) {
        return function (action) {
            console.log('logMiddleware action received:', action)
            return next(action)
        }
    }
}
var thunkMiddleware = function ({ dispatch, getState }) {
  // console.log('Enter thunkMiddleware');
  return function(next) {
      // console.log('Function "next" provided:', next);
      return function (action) {
          // console.log('Handling action:', action);
          return typeof action === 'function' ?
              action(dispatch, getState) :
              next(action)
      }
  }
}

module.exports.middlewares = {logMiddleware:logMiddleware,thunkMiddleware:thunkMiddleware};
