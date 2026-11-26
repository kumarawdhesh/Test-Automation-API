import { createStore, applyMiddleware } from "redux";
// import userReducers from './Reducers/userReducers'
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import logger from "redux-logger";
import rootReducer from "./Reducers/rootReducers";

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(logger, thunk))
);

export default store;
