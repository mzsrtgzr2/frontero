export default (state = {}, action) => {
    console.info('Reducer was called with state', state,' and action ',action);
    switch (action.type) {
        case 'SAY_SOMETHING':
            return {
                  ...state,
                  message: action.message
            }
        default:
            return state;
    }
}
