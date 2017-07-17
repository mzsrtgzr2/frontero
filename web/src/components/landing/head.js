import React from 'react'
import NavLink from '../common/navLink/navLink'
import AuthenticateDev from './authenticateDev'

export default React.createClass({
  componentDidMount :function(){
     $('.modal-trigger').leanModal();
  },
  render:function() {

    return (
  <div>
    <nav>
      <div className="nav-wrapper amber darken-2">
        <a href="" className="brand-logo"><img src="../images/logo.jpg" height="50"/></a>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          <VerifyToken/>
          <li><NavLink to="/gs">Get Started</NavLink></li>
          <li><NavLink to="/Tutorials">Tutorials</NavLink></li>
          <li><NavLink to="/Features">Features</NavLink></li>
          <li><NavLink to="/Pricing">Pricing</NavLink></li>
        </ul>
      </div>
    </nav>
    <AuthenticateDev/>
    {this.props.children}
    </div>
    )}

})


var VerifyToken = function (props){
  return <li><a className="modal-trigger" href="#modal-authenticateDev">Dashboard</a></li>;
};
