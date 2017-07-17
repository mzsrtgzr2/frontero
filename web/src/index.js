import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './stores';
import {IndexRoute,Router,Route,browserHistory} from 'react-router';
import Pricing from './components/landing/pricing';
import gs from './components/landing/gettingStarted';
import Login from './components/landing/authenticateDev';
import Features from './components/landing/features';
import Tutorials from './components/landing/tutorials';
import Home from './components/landing/home';
import routes from './routes'
const store = configureStore();

/*render((
  <Router history={browserHistory}>
    <Route path="/" component={Landing}>
      <IndexRoute component={Home}/>
      <Route path="/features" component={Features}/>
      <Route path="/pricing" component={Pricing}/>
      <Route path="/gs" component={gs}/>
      <Route path="/login" component={Login}/>
      <Route path="/tutorials" component={Tutorials}/>
    </Route>
    <Route path="/dashboard" component={Dashboard}/>
  </Router>
),document.getElementById('app'))*/
render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
  </Provider>,
  document.getElementById('app')
);
/*render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);*/
