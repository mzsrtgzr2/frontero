/* CAUTION: When using the generators, this file is modified in some places.
 *          This is done via AST traversal - Some of your formatting may be lost
 *          in the process - no functionality should be broken though.
 *          This modifications only run once when the generator is invoked - if
 *          you edit them, they are not updated again.
 */
import React, { Component, PropTypes} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Main from '../components/Main';
import {FronteroTeamCore}  from '../../clientlib/fronteroTeamCore';
import actions from '../actions/fronteroCore/fronteroCore'
/* Populated by react-webpack-redux:reducer */
//import reducer from '../reducers/index';
//import { createStore } from 'redux'


//let store = createStore(reducer);


class App extends Component {
  constructor(props){
    super(props);
   // console.log('******************');
   // console.log(store.getState());
   // console.log('******************');
    //this.props.initFrontero();
  }



  componentDidMount(){
    this.props.initFrontero();
    $('.parallax').parallax();
  }
  render() {
    return (
      <div>
        {/*<Landing actions={actions}/>*/}
        <div>
        {this.props.children}
        </div>
      </div>
    );
    //return <Main actions={actions}/>;
  }
}
/* Populated by react-webpack-redux:reducer
 *
 * HINT: if you adjust the initial type of your reducer, you will also have to
 *       adjust it here.
 */
App.propTypes = {

};
function mapStateToProps(state) {
  /* Populated by react-webpack-redux:reducer */

  const props = {};
  return props;
}
function mapDispatchToProps(dispatch) {
  /* Populated by react-webpack-redux:action */
  //const actions = {};
  //const actionMap = { actions: bindActionCreators(actions, dispatch) };
  return bindActionCreators(actions, dispatch)
  //return actionMap;
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
