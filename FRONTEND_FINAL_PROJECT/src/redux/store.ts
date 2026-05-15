import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postsReducer from "./posts/postsSlice";

export const store = configureStore({
  // Ключевое слово export обязательно!
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
