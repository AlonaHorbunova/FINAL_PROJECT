import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { IPost } from "../../types/index";
import { AxiosError } from "axios"; // Добавляем импорт типа ошибки

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

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/posts");
      return response.data;
    } catch (err: unknown) {
      // Используем unknown вместо any
      const error = err as AxiosError<{ message: string }>; // Уточняем тип
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке постов",
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
      });
  },
});

export default postsSlice.reducer;
