import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { IPost } from "../../types/index";
import { AxiosError } from "axios";

// Реэкспортируем тип наружу для компонентов, чтобы не запутаться в путях импорта
export type { IPost };

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

// 1. Явно указываем типы для thunk: <ЧтоВозвращаем, ЧтоПринимаем> -> <IPost[], void>
export const fetchPosts = createAsyncThunk<IPost[], void>(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/posts");
      // Принудительно кастим к IPost[], чтобы убрать ошибку inferred type в консоли
      return response.data as IPost[];
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке постов",
      );
    }
  },
);

// 2. Точно так же типизируем добавление поста: <IPost, FormData>
export const addPost = createAsyncThunk<IPost, FormData>(
  "posts/addPost",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data as IPost;
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
      .addCase(addPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default postsSlice.reducer;
