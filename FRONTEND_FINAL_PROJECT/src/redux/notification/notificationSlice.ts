import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { IUser } from "../../types";

export interface INotification {
  _id: string;
  receiver: string;
  issuer: IUser; // Кто совершил действие (подгрузится объект с username и avatar)
  type: "like" | "comment" | "follow";
  post?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: INotification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

// Экшен для начальной загрузки истории уведомлений из базы при старте
export const fetchNotificationsThunk = createAsyncThunk<INotification[], void>(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/notifications");
      // Возвращаем массив (если бэк возвращает { notifications: [...] }, то пиши response.data.notifications)
      return Array.isArray(response.data)
        ? response.data
        : response.data.notifications || [];
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Не удалось загрузить уведомления";
      return rejectWithValue(message);
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // 🔥 Экшен для добавления уведомления, прилетевшего по сокетам прямо сейчас
    addNotification: (state, action: PayloadAction<INotification>) => {
      state.notifications.unshift(action.payload); // Добавляем в самый верх списка
    },
    // Очистка уведомлений при логауте
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
