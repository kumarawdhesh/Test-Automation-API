import {combineReducers} from 'redux'
import  resultReducers  from './resultReducers'

const rootReducer = combineReducers(
    {
        result: resultReducers
    }
)

export default rootReducer