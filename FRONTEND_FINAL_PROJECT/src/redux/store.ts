import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import postsReducer from "./posts/postsSlice";
import userReducer from "./user/userSlice";
import chatReducer from "./chat/chatSlice"; // ВОТ ЭТОЙ СТРОКИ НЕ ХВАТАЛО

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    user: userReducer,
    chat: chatReducer, // Теперь всё верно
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
