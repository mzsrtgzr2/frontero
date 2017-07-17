import React from 'react'
import {IndexRoute,Router,Route,browserHistory} from 'react-router'
import Pricing from 'components/landing/pricing'
import gs from 'components/landing/gettingStarted'
import AuthenticateDev from 'components/landing/authenticateDev'
import Features from 'components/landing/features'
import Tutorials from 'components/landing/tutorials'
import Home from 'components/landing/home'
import App from './containers/App'
import Landing from './containers/landing'
import Dashboard from './containers/dashboard'

export default (
    <Route component={App}>
      <Route path="/" component={Landing}>
        <IndexRoute component={Home}/>
        <Route path="/features" component={Features}/>
        <Route path="/pricing" component={Pricing}/>
        <Route path="/gs" component={gs}/>
        <Route path="/authenticateDev" component={AuthenticateDev}/>
        <Route path="/tutorials" component={Tutorials}/>
      </Route>
      <Route path="/dashboard" component={Dashboard}/>
    </Route>
)
