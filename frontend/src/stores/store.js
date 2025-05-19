import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../slices/homeSlice";
import registerReducer from "../slices/registerSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
    register: registerReducer,
  },
});
