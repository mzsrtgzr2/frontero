import Head from '../components/landing/head'
import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
//import {TestTest,App} from '../../../widget/dist/react-npm-boilerplate'

import {Main} from '../../../widget/lib/widget'

class Landing extends React.Component {
  constructor(props){
    super(props);

  }
  render() {
    return (
      <div>
        <Head/>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    frontero:state.fronteroCore.frontero
  }
}
const mapDispatchToProps = (dispatch) => {

    // bindActionCreators will wrap all the function in the passed in object
    // with the dispatch function so that the actionCreators can be called
    // directly; without dispatch eg this.props.addTodo(sometodo)
    //return bindActionCreators(actions, dispatch)
}
export default connect(mapStateToProps)(Landing)
