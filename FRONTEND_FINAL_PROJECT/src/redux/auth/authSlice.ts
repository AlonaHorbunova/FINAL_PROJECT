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
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

// 1. Экшен для ЛОГИНА
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
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        err.response?.data?.message || "Ошибка авторизации",
      );
    }
    return rejectWithValue("Непредвиденная ошибка");
  }
});

// 2. Экшен для РЕГИСТРАЦИИ
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
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        err.response?.data?.message || "Ошибка при регистрации",
      );
    }
    return rejectWithValue("Непредвиденная ошибка");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Логика для LOGIN
      .addCase(loginUser.pending, (state) => {
        // Убрали : AuthState
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // Тут он сам поймет и state, и action
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка входа";
      })

      // Логика для REGISTER
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
        state.error = action.payload ?? "Ошибка регистрации";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
