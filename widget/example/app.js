import React from 'react'
import {Feed} from '../src/index'
import {FronteroCore}  from '../../clientlib/src/fronteroCore'
import {FronteroTeamCore}  from '../../clientlib/src/fronteroTeamCore'

export class App extends React.Component {
   constructor(){
    super();
    this.state = {};
    this.init();

    /*let api = new FronteroTeamCore({endPoint:`http://localhost:3030`});
    api.authenticate({
        username: 'fro1234',
        password: '123456789'
      }).then(() =>{
        let developer = api.developer();
        developer.getApps().then(
          (apps) => {
            let app = apps[0];
          },
          (error) =>{

          }
        );
      })*/
  }
  async init(){
    try{
      let teamApi = new FronteroTeamCore({endPoint:`http://localhost:3030`});
      let api = new FronteroCore({endPoint:`http://localhost:3030`});
      await this.auth(teamApi);
      let apps = await this.getApps(teamApi);
      let channel = await this.getChannel(api,apps[0]);
      this.setState({channel:channel});
    } catch (err){
      console.error(err);
    }
  }
  auth(api){
    return api.authenticate({
        username: 'fro1234',
        password: '123456789'
      });
  }
  getApps(api){
    let developer = api.developer();
    return developer.getApps();
  }
  getChannel(api,app){
    return api.channel({
            channelName: 'testChannel' ,
            key: app.key,
            secret: app.secret,
            user: {
                username: 'Humi1990',
                email: 'humi@gmail.com'
            }
     }).connect();
  }

  render() {
    return (<div>
      <h1>bla bla bla</h1>
      {this.state.channel && <Feed channel={this.state.channel} user={this.state.channel._data.user}/>}
      </div>
    )
  }
}
