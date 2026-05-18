import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postsReducer from "./posts/postsSlice";
import userReducer from "./user/userSlice"; // 1. Импортируем наш новый редьюсер

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    user: userReducer, // 2. Регистрируем его в глобальном стейте под ключом user
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
