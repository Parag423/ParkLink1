import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signupdata:null
};

const signupSlice = createSlice({
  name: "signup",
  initialState: initialState,
  reducers: {
    setSignupdata(state, value) {
      state.signupdata = value.payload;
    }
   
  },
});

export const { setSignupdata } = signupSlice.actions;

export default signupSlice.reducer;



