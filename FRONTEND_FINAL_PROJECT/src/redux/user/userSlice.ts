import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { AxiosError } from "axios";
import axios from "axios";

// Описываем интерфейс пользователя на основе полей из модели и макета
export interface IUser {
  _id: string;
  id?: string;
  username: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

interface UserState {
  profileUser: IUser | null; // Пользователь, чей профиль мы сейчас смотрим (мы сами или чужой)
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profileUser: null,
  loading: false,
  error: null,
};

// Экшен получения данных текущего авторизованного пользователя (GET /api/users/me)
export const fetchCurrentUser = createAsyncThunk<IUser, void>(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/me");
      // Бэкенд возвращает объект { user: { ... } }, поэтому забираем response.data.user
      return response.data.user as IUser;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке профиля",
      );
    }
  },
);

// Экшен получения чужого профиля по ID (GET /api/users/:id)
export const fetchUserById = createAsyncThunk<IUser, string>(
  "user/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      // Тут бэкенд тоже возвращает объект { user: { ... } }
      return response.data.user as IUser;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Пользователь не найден",
      );
    }
  },
);

// ВНЕДРЕНО: Экшен обновления профиля (PUT /api/users/update)
// На вход принимает FormData, так как внутри будет находиться файл аватарки
export const updateUserProfile = createAsyncThunk<IUser, FormData>(
  "user/updateUserProfile",
  async (formData, { rejectWithValue }) => {
    try {
      // Напрямую берем токен авторизации из localStorage
      const token = localStorage.getItem("token");

      // Шлем запрос НАПРЯМУЮ на порт бэкенда (3000), минуя axiosInstance и его заглушки
      const response = await axios.put(
        "http://localhost:3000/api/users/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Браузер автоматически выставит 'multipart/form-data' для FormData, вручную писать не нужно
          },
        },
      );

      // Возвращаем то, что реально сохранил и ответил бэкенд
      return response.data.user as IUser;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Не удалось обновить профиль",
      );
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Очистка данных профиля при размонтировании страницы (чтобы не мелькал старый профиль)
    clearProfile: (state) => {
      state.profileUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Текущий пользователь (/me)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Чужой пользователь (:id)
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ВНЕДРЕНО: Обработка обновления профиля
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Перезаписываем данные в стейте актуальной инфой с бэка — интерфейс сразу обновится!
        state.profileUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
