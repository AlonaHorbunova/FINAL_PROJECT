import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";
import type { IUser } from "../../types";

interface AuthResponse {
  user: IUser;
  token: string;
}

interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  // ВАЖНО: Проверяем, чтобы токен не был строкой "undefined"
  token:
    localStorage.getItem("token") === "undefined"
      ? null
      : localStorage.getItem("token"),
  loading: false,
  error: null,
};

// 1. ЛОГИН
export const loginUser = createAsyncThunk<
  AuthResponse,
  Record<string, string>,
  { rejectValue: string }
>("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      userData,
    );
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err))
      return rejectWithValue(err.response?.data?.message || "Ошибка входа");
    return rejectWithValue("Непредвиденная ошибка");
  }
});

// 2. РЕГИСТРАЦИЯ
export const registerUser = createAsyncThunk<
  AuthResponse,
  Record<string, string>,
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      userData,
    );
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err))
      return rejectWithValue(
        err.response?.data?.message || "Ошибка регистрации",
      );
    return rejectWithValue("Непредвиденная ошибка");
  }
});

// 3. ПОЛУЧЕНИЕ ЮЗЕРА
export const getMe = createAsyncThunk<IUser, void, { rejectValue: string }>(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<IUser>("/auth/me");
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err))
        return rejectWithValue(
          err.response?.data?.message || "Ошибка загрузки профиля",
        );
      return rejectWithValue("Ошибка");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка";
      })

      // GET ME
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
