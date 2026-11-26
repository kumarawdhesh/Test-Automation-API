import {  GET_RESULT_REQUEST, GET_RESULT_SUCCESS, GET_RESULT_FAILURE } from '../actionTypes'
import axios from 'axios'

export const getResult = () => {
    return (dispatch) => {
        dispatch(getResultRequest);
        let uid = 1;
        axios.get(`https://jsonplaceholder.typicode.com/users/${uid}`)
            .then(response => {
                dispatch(getResultSuccess(response.data));
            })
            .catch(error => {
                console.log(error)
                dispatch(getResultFailure(error));
            })
    }
    
    
}



export const getResultRequest = () => {
    return {
        type: GET_RESULT_REQUEST,
        loading: 'true'
    }
}

export const getResultSuccess = (user) => {
    return {
        type: GET_RESULT_SUCCESS,
        loading: 'false',
        payload: { user }
        
    }
}

export const getResultFailure = (error) => {
    return {
        type: GET_RESULT_FAILURE,
        loading: 'false',
        payload: { error }
        
    }
}