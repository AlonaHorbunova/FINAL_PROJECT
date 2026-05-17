import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { IPost } from "../../types/index";
import { AxiosError } from "axios";

interface PostsState {
  items: IPost[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  loading: false,
  error: null,
};

// 1. Экшен для получения всех постов (твой существующий)
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/posts");
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке постов",
      );
    }
  },
);

// 2. НОВЫЙ ЭКШЕН: Создание поста (принимает FormData с картинкой и описанием)
export const addPost = createAsyncThunk(
  "posts/addPost",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Передаем третьим аргументом объект конфигурации с headers
      const response = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // Бэкенд возвращает populatedPost
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при создании поста",
      );
    }
  },
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Кейсы для загрузки постов
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Кейсы для добавления поста
      .addCase(addPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        // Ключевой момент инстаграм-логики:
        // Добавляем созданный пост в НАЧАЛО массива (items), чтобы юзер сразу увидел его первым в ленте!
        state.items.unshift(action.payload);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default postsSlice.reducer;
