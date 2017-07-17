export default (state = {}, action) => {
    switch (action.type) {
        case 'initFrontero':
        {
            return Object.assign({}, state, {
                frontero:action.payload
            })
        }
        case 'createApp':
        {
            return Object.assign({}, state, {
                app:action.response
            })
        }
        case 'updateApp':
        {
            /*return Object.assign({}, state, {
                frontero:action.payload
            })*/
        }
        case 'getApps':
        {
            return Object.assign({}, state, {
                app:action.response
            })
        }
        default:
            return state;

    }
}
