
/**
 * Created by doron on 12/07/2016.
 */

import React from 'react'
import NavLink from '../common/navLink/navLink'
import { withRouter ,browserHistory} from 'react-router'
import {Icon} from 'react-materialize';
import 'materialize-css/dist/js/materialize.min.js';
//import actions from '../../actions/fronteroCore/fronteroCore'
import * as actions  from '../../actions/fronteroCore/fronteroCore'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
var validate = require('validate.js');


//let currentValue;
class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      credentials:props.credentials,
      errormsgs:[]

    };
    if (this.props.signInState){
      browserHistory.push('/dashboard');
    }

   // store.subscribe(this.handleStateChange);
    this.signin = this.signin.bind(this);
  }
  componentDidMount() {
    //this.props.initFrontero();
    //this.setState({credentials:this.props.credentials});
  }

   select(state) {
    return state.auth.signInState;
   }

  validateInput(){
    var res = validate({
      username: this.state.credentials.username,
      password: this.state.credentials.password
    }, this.props.constraints);

    for (var index in res) {
      Array.from(res[index]).forEach(value=> {
        this.state.errormsgs.push(value)
      });
    }
  }

  handleStateChange(){

    let previousValue = this.props.signInState;
    this.state.signInState = this.select(store.getState());



    if (previousValue !== this.state.signInState) {
      console.log('Some deep nested property changed from', previousValue, 'to', this.state.signInState);
    }
  }
  handleChange(field, e) {

    this.state.errormsgs = [];
    let newState = {credentials:this.state.credentials}
    newState.credentials[field] = e.target.value;
    this.setState(newState);
    this.validateInput();


  }

   signin() {
    var payload = {};
      payload.credentials = this.state.credentials;
      payload.frontero = this.props.frontero;
      this.validateInput();
      if (!this.props.signInState) {
         this.props.authenticateDevAccount(payload);
      }
      else{
        browserHistory.push('/dashboard');
      }
  }

  render() {
    return (<div className="black-text">
    <div id="modal-signin">
        <div className="container">
          <div className="row">
            <div className="header_c">SIGN IN</div>
            <form action="#" className="col s12">
              <div className="input-field">
              <Icon className="prefix">account_circle</Icon>
                <input value={this.state.credentials.username} onChange={this.handleChange.bind(this,'username')} id="username" type="text" className="validate"/>
                <label for="username">Login</label>
              </div>
              <div className="input-field">
                <Icon className="prefix">vpn_key</Icon>
                <input id="password" value={this.state.credentials.password} onChange={this.handleChange.bind(this,'password')} type="password" className="validate"/>
                <label for="password">password</label>
              </div>
            </form>
            <div>
              <button className="waves-effect waves-light btn arc_s col s12"  onClick={this.signin}>SIGN IN</button>
            </div>
            <div className="text_ref_s m-t">
              <a href="#">Forgot password?</a>
            </div>
            <div className="text_err m-t">
              {
                this.state.errormsgs.map(function(msg,i) {
                  return <li key={i}>{msg}</li>
                })
              }
              <li className={ this.props.signInStateMsg == '' ? 'hide' : ''}>{this.props.signInStateMsg}</li>
            </div>
          </div>
        </div>
    </div>
  </div>
    )}
}

SignIn.defaultProps = {
  credentials:{
    password:'',
    username:''
  },
  signInState:false,
  signInStateMsg:'',
  constraints : {
    username: {
      presence: true,
      length: {
        minimum: 6,
        message: 'must be at least 6 characters'
      }
    },
    password: {
      presence: true,
      length: {
        minimum: 8,
        message: 'must be at least 8 characters'
      }
    }
  }
};
const mapStateToProps = (state) => {
  return {
    frontero:state.fronteroCore.frontero,
    signInState:state.auth.signInState,
    signInStateMsg:state.auth.signInStateMsg
  }
}
const mapDispatchToProps = (dispatch) => {

  // bindActionCreators will wrap all the function in the passed in object
  // with the dispatch function so that the actionCreators can be called
  // directly; without dispatch eg this.props.addTodo(sometodo)
  return bindActionCreators(actions, dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(SignIn)
