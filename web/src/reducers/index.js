/* Combine all available reducers to a single root reducer.
 *
 * CAUTION: When using the generators, this file is modified in some places.
 *          This is done via AST traversal - Some of your formatting may be lost
 *          in the process - no functionality should be broken though.
 *          This modifications only run once when the generator is invoked - if
 *          you edit them, they are not updated again.
 */
import { combineReducers } from 'redux';
import main from './main';
import auth from './auth/auth'
import fronteroCore from './fronteroCore/fronteroCore'
/* Populated by react-webpack-redux:reducer */
const reducers = {
  main:main,
  auth:auth,
  fronteroCore:fronteroCore};
module.exports = combineReducers(reducers);