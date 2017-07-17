import React from 'react'
import '../../styles/main.css'
import '../../styles/bubble.css'

//import 'simple_line_icons'
export default class Feed extends React.Component{
  constructor(props){
    super();
    this.state = {
      messages: [],
      message: 'ddd',
      offset: 0,
      isLoading : false
    };
    this.sendMessage = this.sendMessage.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.isScrolling = this.isScrolling.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
    this.messageChange = this.messageChange.bind(this);
  }
  sendMessage(){
    this.props.channel.send('push:add','hello world').then(
      (push)=>{ // success
            let newArray = [ ...this.state.messages, push ];
            this.setState({messages:newArray});
      }, (err) => { // fail

      });
  }
  getMessages(offset){
    return this.props.channel.send('push:query', {
    offset: this.state.offset, // default is 0
    limit: 3 // default is 10
    })
  }
  async componentDidMount(){
    let messages = await this.getMessages();
    this.setState({messages:messages});
    this.scrollBottom();
  }
  async isScrolling(e){
    if(this.state.isLoading == false){
      let el = e.target;
      console.log(el.scrollTop);

      if(el.scrollTop == 0){
        this.setState({isLoading:true})
        let messages = await this.getMessages();
        let newMessages = this.state.messages.concat(messages);
        this.setState({
          messages:newMessages,
          offset: this.state.offset + 3
        });
        this.setState({isLoading:false})
      }
    }
  }
  scrollBottom(){
    let el = this.refs.mesContainer;
    el.scrollTop = el.scrollHeight - el.getBoundingClientRect().height;
  }
  messageChange(e){
    this.setState({message:e.target.value});
  }
  render(){
    return (
      <div>
        {this.state.isLoading && <span>Loading!!!</span>}
        <span>{this.state.message}</span>
        <div className='testcss'>This is my feed my feed is amazing</div>
        <div onClick={this.sendMessage}>Send</div>
      <span className="medium-icons">
          <i className="icon-emotsmile icons"></i>
        </span>


        <div className="container">
          <div id="mesContainer" ref="mesContainer" className="mesContainer" onScroll={this.isScrolling}>
            {/*<img className="bgImg" src={require('./bg.jpg')}/>*/}
            <MesContainer messages={this.state.messages} user={this.props.user}/>
          </div>
          <MesInput className="MesInput" onChange={this.messageChange}/>
        </div>
        <div>
        </div>
      </div>)
  }
}
var MesInput = (props) => (
<div className="inputContainer">
  <input type="text" placeholder="Enter message..." onChange={props.onChange}/>

</div>
);

var MesContainer = (props) => (
  <div>
      {
        props.messages.map(
          function(mes,index){
            let mesClass = mes.userId == props.user.id ? 'right-in my-tri my-talk-bubble': 'left-in other-tri other-talk-bubble';
            return <div className={'talk-bubble round tri-right '+  mesClass} key={index}>
              <div className="talktext">
                <p>{mes.payload.data.sys.value}</p>
              </div>
            </div>;
        }
      )}
  </div>
);
/*var MesContainer = (props) => (
  <div>
      {
        props.messages.map(function(mes){
        return <span className='myMes' key={mes._id}>{mes.payload.data.sys.value}</span>;
      })}
  </div>
);*/
/*class MesContainer extends React.Component{
  render(){
    var mesClass = 'otherMes'
    return(<div>
        {
          this.props.messages.map(function(mes){
          return <span className={mesClass} key={mes._id}>{mes.payload.data.sys.value}</span>;
        })}
      </div>
    )
  }
}*/
