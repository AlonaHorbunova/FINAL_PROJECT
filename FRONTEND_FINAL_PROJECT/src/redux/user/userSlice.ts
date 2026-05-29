import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { AxiosError } from "axios";
import axios from "axios";
import { IUser } from "../../types";

interface UserState {
  profileUser: IUser | null;
  searchResults: IUser[]; // 🔥 Добавили поле для хранения результатов поиска
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profileUser: null,
  searchResults: [], // Изначально поиск пустой
  loading: false,
  error: null,
};

// Экшен получения данных текущего пользователя
export const fetchCurrentUser = createAsyncThunk<IUser, void>(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data.user as IUser;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке профиля",
      );
    }
  },
);

// Экшен получения чужого профиля по ID
export const fetchUserById = createAsyncThunk<IUser, string>(
  "user/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data.user as IUser;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Пользователь не найден",
      );
    }
  },
);

// 🔥 Новое асинхронное действие для живого поиска пользователей
export const searchUsersThunk = createAsyncThunk<IUser[], string>(
  "user/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/search?query=${query}`);
      return response.data.users as IUser[];
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при поиске пользователей",
      );
    }
  },
);

export const updateUserProfile = createAsyncThunk<IUser, FormData>(
  "user/updateUserProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3000/api/users/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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
    clearProfile: (state) => {
      state.profileUser = null;
      state.error = null;
    },
    // 🔥 Очистка результатов поиска, когда закрываем шторку
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Текущий пользователь (/me)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.profileUser = null;
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
        state.profileUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔥 Живой поиск пользователей
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })

      // Обработка обновления профиля
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
