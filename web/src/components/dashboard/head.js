import React from 'react'
import {Link} from 'react-router'
import NavLink from '../common/navLink/navLink'
import {NavItem,Navbar,Modal} from 'react-materialize'

export default React.createClass({
  render:function() {
    return (<div>
      <Navbar className="blue darken-2" right brand={[<img src="../images/logo.jpg" height="50"/>]}>
        <NavLink to="/gs">Log out</NavLink>
        <NavLink to="/gs">Get Started</NavLink>
        <NavLink to="/Tutorials">Tutorials</NavLink>
        <NavLink to="/Features">Features</NavLink>
        <NavLink to="/Pricing">Pricing</NavLink>
      </Navbar>
      {this.props.children}
      </div>
    )}
})
/*<Navbar>
  <img src="../images/logo.jpg" width="50" height="50"/>
  <NavLink className="right" to="/login">Login</NavLink>
  <NavLink className="right" to="/gs">Get Started</NavLink>
  <NavLink className="right" to="/Tutorials">Tutorials</NavLink>
  <NavLink className="right" to="/Features">Features</NavLink>
  <NavLink className="right" to="/Pricing">Pricing</NavLink>
</Navbar>*/
