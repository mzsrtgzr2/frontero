import React from 'react'
import {Link} from 'react-router'
import {Icon} from 'react-materialize';
import 'materialize-css/dist/js/materialize.min.js'
import actions from '../../actions/fronteroCore/fronteroCore'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'



var validate = require('validate.js');

class SignUp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      credentials:props.credentials,
      errormsgs:[]
    };
    this.signup = this.signup.bind(this);
  }
  componentDidMount() {

    //this.props.initFrontero();
    //this.setState({credentials:this.props.credentials});
  }

  validateInput(){
    this.state.errormsgs = [];
    var res = validate({
      username: this.state.credentials.username,
      password: this.state.credentials.password,
      email: this.state.credentials.email
    }, this.props.constraints);

    for (var index in res) {
      Array.from(res[index]).forEach(value=> {
        this.state.errormsgs.push(value)
      });
    }
    if (!this.props.signUpState){
      if (this.props.signUpStateMsg) {
        this.state.errormsgs.push(this.props.signUpStateMsg);
      }
    }
  }

  handleChange(field, e) {

    let newState = {credentials:this.state.credentials}
    newState.credentials[field] = e.target.value;
    this.setState(newState);
    this.validateInput();

  }

  signup(){
    var payload = {};
    payload.credentials = this.state.credentials;
    payload.frontero = this.props.frontero;
    this.validateInput();
    if (this.state.errormsgs.length == 0) {
      this.props.createDevAccount(payload);
    }

  }

  render() {
    return (<div className="black-text">

    <div id="modal-signup">
        <div className="container">
          <div className="row">
            <div className="header_c ">Create A new Account</div>
            <form action="#" className="col s12">
              <div className="input-field">
              <Icon className="prefix">account_circle</Icon>
                <input value={this.state.credentials.username} onChange={this.handleChange.bind(this,'username')} id="username" type="text" className="validate"/>
                <label for="username">username</label>
              </div>
              <div className="input-field">
                <Icon className="prefix">email</Icon>
                <input value={this.state.credentials.email} onChange={this.handleChange.bind(this,'email')} id="email" type="email" className="validate"/>
                <label for="email">Email</label>
              </div>
              <div className="input-field">
                <Icon className="prefix">vpn_key</Icon>
                <input id="password" value={this.state.credentials.password} onChange={this.handleChange.bind(this,'password')} type="password" className="validate"/>
                <label for="password">password</label>
              </div>
            </form>
            <div>
              <button className="waves-effect waves-light btn col s12 arc_s" onClick={this.signup} >SIGN UP</button>
            </div>
            <div className="text_err m-t">
              {
                this.state.errormsgs.map(function(err,i)
                {
                  return <li key={i}>{err}</li>
                })
              }
            </div>
          </div>
        </div>
    </div>
  </div>
    )}

}

SignUp.defaultProps = {
  credentials:{
    password:'',
    email:'',
    username:''
  },
  signUpState:false,
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
        message: 'ust be at least 8 characters'
      }
    },
    email: {
      email: {
        message: "doesn't look like a valid email"
      }
    }
  }
};
const mapStateToProps = (state) => {
  return {
    frontero:state.fronteroCore.frontero,
    signUpState:state.auth.signUpState,
    signUpStateMsg:state.auth.signUpStateMsg
  }
}
const mapDispatchToProps = (dispatch) => {

  // bindActionCreators will wrap all the function in the passed in object
  // with the dispatch function so that the actionCreators can be called
  // directly; without dispatch eg this.props.addTodo(sometodo)
  return bindActionCreators(actions, dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(SignUp)
