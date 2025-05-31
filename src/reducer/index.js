import {combineReducers} from "@reduxjs/toolkit";


import signupReducer from "../slices/signup";

const rootReducer  = combineReducers({
  signup: signupReducer
})

export default rootReducer;

