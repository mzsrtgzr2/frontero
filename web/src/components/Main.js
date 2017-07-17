require('styles/App.css');
import 'materialize-css/dist/js/materialize.min.js';
import 'materialize-css/dist/css/materialize.css';
import {Button, Icon,Modal,Collection,CollectionItem,Row,Input} from 'react-materialize';
import React from 'react';
import {connect} from 'react-redux';
import {actions} from '../actions/main'
let yeomanImage = require('../images/yeoman.png');

class AppComponent extends React.Component {
  onTimeButtonClick(delay){
    this.props.dispatch(actions.getTime(delay))
  }
  render() {
    var { frozen, time, reduxState } = this.props
    var attrs = {}
    const DELAY = 500 // in ms
    if (frozen) {
        attrs = {
          disabled: true
        }
    }
    return (
      <div className="index">
         <b>What time is it?</b> { time ? `It is currently ${time}` : 'No idea yet...' }
           <button { ...attrs } onClick={() => this.onTimeButtonClick(DELAY)}>Get time!</button>
             <pre>
            redux state = { JSON.stringify(reduxState, null, 2) }
          </pre>
        <Modal header='Modal Header'
  trigger={
    <Button waves='light'>MODAL</Button>
  }>
  <p>xxxxx ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>
</Modal>

<Collection>
  <CollectionItem href='#'>Alvin</CollectionItem>
  <CollectionItem href='#' active>Alvin</CollectionItem>
  <CollectionItem href='#'>Alvin</CollectionItem>
  <CollectionItem href='#'>Alvin</CollectionItem>
</Collection>
        <a className="waves-effect waves-light btn">button</a>
        <img src={yeomanImage} alt="Yeoman Generator" />
        <div className="notice">xxxxxx sadasdsa <code>src/components/Main.js</code> to get started!</div>
      </div>
    );
  }
}
// This is our select function that will extract from the state the data slice we want to expose
// through props to our component.
const mapStateToProps = (state/*, props*/) => {
  return {
    frozen: state._time.frozen,
    time: state._time.time,
    // It is very bad practice to provide the full state like that (reduxState: state) and it is only done here
    // for you to see its stringified version in our page. More about that here:
    // https://github.com/rackt/react-redux/blob/v4.0.0/docs/api.md#inject-dispatch-and-every-field-in-the-global-state
    reduxState: state,
  }
}

const ConnectedAppComponent = connect(mapStateToProps)(AppComponent)


AppComponent.defaultProps = {
};

export default AppComponent;
