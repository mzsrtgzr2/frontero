import React from 'react'
import {Cool} from './components/cool'
import Message from './components/chat/message'
import Feed from './components/chat/feed'
/*module.exports = React.createClass({
  render: function () {

   return (
     <div>
     <Cool/>
      sadasdsadasdas
     </div>
   )
 }
})*/


class Main extends React.Component{
  render(){
    return (<div>


      </div>
    )
  }
}


module.exports.Feed = Feed;
module.exports.Message = Message;
module.exports.Cool = Cool;
