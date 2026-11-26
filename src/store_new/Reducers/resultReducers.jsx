import { GET_RESULT_REQUEST, GET_RESULT_SUCCESS, GET_RESULT_FAILURE } from '../actionTypes'

let initialState = {
    loading: false,
    result: [],
    error: ''
}


const resultReducers = (state = initialState, action) => {
    switch (action.type) {
        case GET_RESULT_REQUEST:
            return { ...state, loading: true }
        case GET_RESULT_SUCCESS:
            return { loading:false, result:action.payload, error: '' }
        case GET_RESULT_FAILURE:
            return {loading:false, result:[], error:action.payload}
        default: return state
    }
}
export default resultReducers