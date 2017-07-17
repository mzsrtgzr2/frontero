var sayActionCreator = function (message) {
    return {
        type: 'SAY_SOMETHING',
        message
    }
}
var asyncSayActionCreator_1 = function (message) {
    return function (dispatch) {
        setTimeout(function () {
            console.log(new Date(), 'Dispatch action now:')
            dispatch({
                type: 'SAY_SOMETHING',
                message
            })
        }, 2000)
    }
}
var getTime = function(delay) {
  return {
    types: ['GET_TIME_REQUEST', 'GET_TIME_SUCCESS', 'GET_TIME_FAILURE'],
    promise: () => {
      return new Promise((resolve, reject) => {
        // Just simulating an async request to a server via a setTimeout
        setTimeout(() => {
          const d = new Date()
          const ms = ('000' + d.getMilliseconds()).slice(-3)
          resolve({
            time: `${d.toString().match(/\d{2}:\d{2}:\d{2}/)[0]}.${ms}`
          })
        }, delay)
      })
    }
  }
}


module.exports.actions = {
  sayActionCreator:sayActionCreator,
  asyncSayActionCreator_1:asyncSayActionCreator_1,
  getTime:getTime
};
