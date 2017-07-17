var actions = {
  signin: (payload) => {
    return {
        type: 'signin',
        payload
    }
  }
}
module.exports = actions;
