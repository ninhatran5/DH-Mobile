import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../slices/homeSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
  },
});
