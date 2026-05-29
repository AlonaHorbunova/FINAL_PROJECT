import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";
import { AxiosError } from "axios";
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
    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
    };

    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      payload,
    );
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      return rejectWithValue(err.response.data.message || "Ошибка регистрации");
    }
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

// 4. СБРОС ПАРОЛЯ (Добавили этот недостающий экшен)
export const resetPasswordAction = createAsyncThunk<
  string,
  { token: string; password: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      `/auth/reset-password/${token}`,
      { password },
    );
    return response.data.message;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        err.response?.data?.message || "Ошибка сброса пароля",
      );
    }
    return rejectWithValue("Непредвиденная ошибка");
  }
});
// 5. ЗАПРОС НА ВОССТАНОВЛЕНИЕ ПАРОЛЯ (Отправка ссылки на почту)
export const forgotPassword = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/forgot-password",
      { identity: email },
    );
    return response.data.message;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        err.response?.data?.message || "Ошибка отправки письма",
      );
    }
    return rejectWithValue("Непредвиденная ошибка");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.clear();
      window.location.href = "/login";
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
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; 
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка загрузки профиля";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
