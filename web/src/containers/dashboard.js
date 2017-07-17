import Head from '../components/dashboard/head'
import React from 'react'
export default React.createClass({
    render:function(){
      return (
        <div>
          <Head/>
          <div>
            {this.props.children}
          </div>
        </div>
      )
    }
})
