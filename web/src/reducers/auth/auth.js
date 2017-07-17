export default (state = {}, action) => {
    switch (action.type) {
        case 'signUp':
          return Object.assign({}, state, {
              signUpState:action.response.state,
              signUpStateMsg:action.response.message
          })
        case 'signIn':
          return Object.assign({}, state, {
              signInState:action.response.state,
              signInStateMsg:action.response.message
          })
        case 'recoverPassword':
            return {
                  ...state,
                  payload:action.payload
            }
        default:
            return state;
    }
}
