import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../slices/homeSlice";
import registerReducer from "../slices/registerSlice";
import loginReducer from "../slices/loginSlice";
import forgotPasswordReducer from "../slices/forgotPasswordSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
    register: registerReducer,
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
  },
});
