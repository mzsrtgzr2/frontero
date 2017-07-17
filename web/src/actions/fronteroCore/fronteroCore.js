
import {FronteroTeamCore}  from '../../../../clientlib/dist/fronteroTeamCore'
import {browserHistory} from 'react-router'

var authenticateDevToken = (params) =>{
  return function (dispatch) {
    return payload.frontero.authenticateDevToken({
      token: payload.credentials.token,
    }).then(
      success => dispatch(authenticateDevTokenSuccess(success)),
      error => dispatch(authenticateDevTokenError(error))
    );
  };
}
var authenticateDevTokenSuccess = (params) =>{

}
var authenticateDevTokenError = (params) =>{

}
var handleauthenticateDevAccountSuccess = () => {
  saveDevToken();
  browserHistory.push('/dashboard');
}
var saveDevToken = (token) => {
  localStorage.setItem("userlinksdevtoken", JSON.stringify(token));

}
var getDevToken = (token) => {

  var token = localStorage.getItem("userlinksdevtoken");
  return token ? JSON.parse(token) : undefined;
}
var authenticateDevAccountSuccess = (params) =>{
 let response = {
    message : 'Developer authentication completed',
    state: true,
    token:params
 };
 handleauthenticateDevAccountSuccess();
 return {
   type:'signIn',
   response
 }
}
var authenticateDevAccountError = () =>{
  let response = {
     message : 'Developer authentication failed',
     state: false
  }

  return {
    type: 'signIn',
    response
  }
}
var createDevAccountSuccess = (params) =>{
 let response = {
   message : 'Developer account creation completed',
   state : true,
   token : params
 }

 return {
   type:'signUp',
   response
 }
}
var createDevAccountError = (params) =>{
  let response = {
    message : 'Developer account creation failed',
    state : false
  }

 return {
   type:'signUp',
   response
 }
}
var updateDevAccountSuccess = (params) =>{
 let response = {
    message : 'Developer credentials updated completed',
    state : true,
    params:params
 }

 return {
   type:'updateDevCredentials',
   response
 }
}
var updateDevAccountError = (params) =>{
  let response = {
     message : 'Developer credentials updated filed',
     state : false,
     params:params
  }
 return {
   type:'updateDevCredentials',
   response
 }
}
var createAppSuccess = (response) =>{
   return {
      type:'createApp',
      response
   }
}
var createAppError = (response) =>{
  return {
   type:'createApp',
   response
  }
}
var updateAppSuccess = (response) =>{
   return {
      type:'updateApp',
      response
   }
}
var updateAppError = (response) =>{
  return {
   type:'updateApp',
   response
  }
}
var getAppsSuccess = (response) =>{
   return {
      type:'getApps',
      response
   }
}
var getAppsError = (response) =>{
  return {
   type:'getApps',
   response
  }
}
var deleteAppSuccess = (response) =>{
   return {
      type:'deleteApp',
      response
   }
}
var deleteAppError = (response) =>{
  return {
   type:'deleteApp',
   response
  }
}
var actions = {
  initFrontero: () => {
    let frontero = new FronteroTeamCore({
          endPoint: `http://localhost:3030`
    });

    return {
        type: 'initFrontero',
        payload:frontero
    }
  },
  authenticateDevAccount:(payload) =>{
    return function (dispatch) {
      return payload.frontero.authenticate({
          username: payload.credentials.username,
          password: payload.credentials.password
        }).then(
          success => dispatch(authenticateDevAccountSuccess(success)),
          error => dispatch(authenticateDevAccountError(error))
      );
    };
  },
  createDevAccount:(payload) =>{
    let developer = payload.frontero.developer();

    return function (dispatch) {
      return developer.create({
          email: payload.credentials.email,
          username: payload.credentials.username,
          password: payload.credentials.password
        }).then(
          success => dispatch(createDevAccountSuccess(success)),
          error => dispatch(createDevAccountError(error))
      );
    };
  },
  updateDevAccount:(payload) =>{
    let developer = payload.frontero.developer();

    return function (dispatch) {
      return developer.update({
          email: payload.credentials.email,
          username: payload.credentials.username,
          password: payload.credentials.password
        }).then(
          success => dispatch(updateDevAccountSuccess(success)),
          error => dispatch(updateDevAccountError(error))
      );
    };
  },
  createApp:(payload) =>{
    let developer = payload.frontero.developer();

    return function (dispatch) {
      return developer.createApp({
          name: payload.name
        }).then(
          success => dispatch(createAppSuccess(success)),
          error => dispatch(createAppError(error))
      );
    };
  },
  getApps:(payload) =>{
    let developer = payload.frontero.developer();

    return function (dispatch) {
      return developer.getApps().then(
          success => dispatch(getAppsSuccess(success)),
          error => dispatch(getAppsError(error))
      );
    };
  },
  updateApp:(payload) =>{
    return function (dispatch) {
      return payload.app.update({name:payload.name}).then(
          success => dispatch(updateAppSuccess(success)),
          error => dispatch(updateAppError(error))
      );
    };
  },
  deleteApp:(payload) =>{
    return function (dispatch) {
      return payload.app.delete().then(
          success => dispatch(deleteAppSuccess(success)),
          error => dispatch(deleteAppError(error))
      );
    };
  }

}

module.exports = actions;
