import React from 'react'
import {Link} from 'react-router'
import {Icon} from 'react-materialize';
import 'materialize-css/dist/js/materialize.min.js'
import actions from '../../actions/fronteroCore/fronteroCore'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import SignUp from './signup'
import SignIn from './signin'

class AuthenticateDev extends React.Component {

  constructor(props) {
     super(props);
     this.state = {
       credentials:props.credentials,
       visibleviewid: "signin",
       activeViewMessage: props.signInMessage
  };

     this.signinview = this.signinview.bind(this);
     this.signupview = this.signupview.bind(this);
  }
  componentDidMount() {

    //var x = this.refs.foo.myFunc;
    //this.signup = this.refs.up.signup;
    //this.signin = this.refs.in.signin;
     //this.props.initFrontero();
     //this.setState({credentials:this.props.credentials});
  }
  handleChange(field, e) {
    let newState = {credentials:this.state.credentials}
    newState.credentials[field] = e.target.value;
    this.setState(newState)
  }
  signupview(){
    this.setState({
      visibleviewid: "signup",
      activeViewMessage: this.props.signUpMessage
    })

  }
  signinview(){
    this.setState({
      visibleviewid: "signin",
      activeViewMessage: this.props.signInMessage
    })
  }
  render() {
    return (

      <div className="black-text">
        <div id="modal-authenticateDev" className="modal modal-s-1 arc_s">
          <div class="modal-content">
             <div> { this.state.visibleviewid == "signin" ? <SignIn ref='in'/> : <SignUp ref='up' /> } </div>
          </div>
          <div className="modal-footer">
            <div className="divider"></div>
            <div className="row m-t text_ref_s">
              <span>{this.state.activeViewMessage.msg1}</span>
              <a href="#!" onClick={this.state.visibleviewid == "signin" ? this.signupview : this.signinview}>{this.state.activeViewMessage.msg2}</a>
            </div>
           </div>
         </div>
      </div>

    )}
}

AuthenticateDev.defaultProps = {
  credentials:{
    password:'',
    email:'',
    username:''
  },
  signInState:false,
  signUpState:false,
  signUpMessage: {
    msg1:"Already have account ? ",
    msg2:"Sign in"
  },
  signInMessage: {
    msg1: "Dont have an account ? ",
    msg2: "Create one now"

  }
};
const mapStateToProps = (state) => {
  return {
    frontero:state.fronteroCore.frontero,
    signInState:state.auth.signInState,
    signUpState:state.auth.signUpState
  }
}
const mapDispatchToProps = (dispatch) => {

    // bindActionCreators will wrap all the function in the passed in object
    // with the dispatch function so that the actionCreators can be called
    // directly; without dispatch eg this.props.addTodo(sometodo)
    return bindActionCreators(actions, dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(AuthenticateDev)
