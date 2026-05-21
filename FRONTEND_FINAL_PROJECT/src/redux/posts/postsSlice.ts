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

// 1. Получение всех постов
export const fetchPosts = createAsyncThunk<
  IPost[],
  void,
  { rejectValue: string }
>("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/posts");
    return response.data as IPost[];
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Ошибка загрузки постов",
    );
  }
});

// 2. Лайк / Анлайк
export const toggleLikePost = createAsyncThunk<
  { postId: string; liked: boolean; userId: string },
  { postId: string; userId: string },
  { rejectValue: string }
>("posts/toggleLikePost", async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/likes/${postId}`);
    return { postId, liked: response.data.liked, userId };
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "Ошибка лайка");
  }
});

// 3. Создание поста
export const addPost = createAsyncThunk<
  IPost,
  FormData,
  { rejectValue: string }
>("posts/addPost", async (formData: FormData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as IPost;
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Ошибка создания поста",
    );
  }
});
export const addComment = createAsyncThunk<
  { postId: string; comment: unknown },
  { postId: string; text: string },
  { rejectValue: string }
>(
  "posts/addComment",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/comments/${postId}`, { text });
      return { postId, comment: response.data };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || "Ошибка добавления комментария");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Обработка fetchPosts
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
        state.error = action.payload || "Ошибка";
      })
      // Обработка addPost
      .addCase(addPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Обработка toggleLikePost
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, liked, userId } = action.payload;
        const post = state.items.find((p) => p._id === postId);
        if (post) {
          if (!post.likes) post.likes = [];
          if (liked) {
            if (!post.likes.includes(userId)) post.likes.push(userId);
          } else {
            post.likes = post.likes.filter((id) => id !== userId);
          }
        }
      })
      // Обработка addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.items.find((p) => p._id === postId);
        if (post) {
          if (!post.comments) post.comments = [];
          post.comments.push(comment);
        }
      });
  },
});

export default postsSlice.reducer;
