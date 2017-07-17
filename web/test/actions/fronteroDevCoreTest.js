/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/

import actions from '../../src/actions/fronteroCore/fronteroCore'
import {FronteroTeamCore,App} from '../../../clientlib/dist/fronteroTeamCore'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {expect,assert} from 'chai';
const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('fronteroCore', () => {
  var api;
  var apps;

  before((done) => {
    api = actions.initFrontero();
    api.payload.debug().emptyDb().then(()=>{
        done();
    });
  });
  it('init Frontero API', (done) => {
    expect(api).to.not.be.undefined;
    expect(api).to.not.be.null;
    assert.instanceOf(api.payload, FronteroTeamCore, "object should be of a type FronteroTeamCore");
    done();
  });
  it('create Developer account', (done) => {
    let payload = {frontero: api.payload};
    payload.credentials = {
      username:'frontero',
      password:'123456789',
      email:'frontero@gmail.com'
    }

    let store = mockStore({
      credentials : {
        username:'',
        password:'',
        email:''
      }
    })
    return store.dispatch(actions.createDevAccount(payload))
       .then(() => { // return of async actions
         let action = store.getActions()[0];
         expect(action.type).to.equal('signUp');
         expect(action.response.state).to.be.a('boolean');
         done();
       })
  });
  it('authenticate Developer account', (done) => {
   let payload = {frontero: api.payload};
   payload.credentials = {
     username:'frontero',
     password:'123456789',
     email:'frontero@gmail.com'
   }

   let store = mockStore({
     credentials : {
       username:'',
       password:'',
       email:''
     }
   })
   return store.dispatch(actions.authenticateDevAccount(payload))
      .then(() => { // return of async actions
        let action = store.getActions()[0]
        expect(action.type).to.equal('signIn');
        expect(action.response.state).to.be.a('boolean');
        done();
      })
 });
  it('update Developer account', (done) => {
    let payload = {frontero: api.payload};
    payload.credentials = {
      username:'fro1234',
      //password:'987654321',
      email:'fro1234@gmail.com'
    }

    let store = mockStore({
      credentials : {
        username:'',
        password:'',
        email:''
      }
    })
    return store.dispatch(actions.updateDevAccount(payload))
       .then(() => { // return of async actions
         let action = store.getActions()[0];
         expect(action.type).to.equal('updateDevCredentials');
         expect(action.response.state).to.be.a('boolean');
         done();
       })
  });
  var createApp = (name) => {
    let payload = {frontero: api.payload};
    payload.name = name;

    let store = mockStore({name : ''});
    return store.dispatch(actions.createApp(payload))
       .then(() => { // return of async actions
         let action = store.getActions()[0];
         expect(action.type).to.equal('createApp');
         assert.instanceOf(action.response, App, "object should be of a type an App");
       })
  };
  it('create an app', async (done) => {
      await createApp('NewApp1');
      await createApp('NewApp2');
      done();
  });
   it('get all apps', (done) => {
    let payload = {frontero: api.payload};

    let store = mockStore({apps : []});
    return store.dispatch(actions.getApps(payload))
       .then(() => { // return of async actions
         let action = store.getActions()[0];
         apps = action.response;
         expect(action.type).to.equal('getApps');
         assert.instanceOf(apps, Array, "should be an App list");
         if(apps instanceof Array){
           apps.forEach(function(app){
              assert.instanceOf(app, App, "object should be of a type an App");
           });
         }
         done();
       })
  });
  it('update app', (done) => {
    done();
   let payload = {
     app:apps[0],
     name:'testApp'
   };
   let store = mockStore({app : {}});
   return store.dispatch(actions.updateApp(payload))
      .then(() => { // return of async actions
        let action = store.getActions()[0];
        expect(action.type).to.equal('updateApp');
        expect(action.response).to.not.be.undefined;
        expect(action.response).to.not.be.null;
        assert.instanceOf(action.response, Object, "app should be type of an Objcet");
        done();
      })
  });
  it('delete app', (done) => {
   let payload = {
     app:apps[1]
   };
   let store = mockStore();
   return store.dispatch(actions.deleteApp(payload))
      .then(() => { // return of async actions
        let action = store.getActions()[0];
        expect(action.type).to.equal('deleteApp');
        done();
      })
    });
});
