import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

interface UserPreview {
  _id: string;
  username: string;
  avatar?: string;
}

export interface Message {
  _id?: string;
  chatId: string;
  sender: UserPreview;
  receiver: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  user: UserPreview;
  lastMessage: string;
  createdAt: string;
  unreadCount?: number;
}

export interface ChatState {
  items: Message[];
  conversations: Conversation[];
  loading: boolean;
}

const initialState: ChatState = {
  items: [],
  conversations: [],
  loading: false,
};

export const fetchMessages = createAsyncThunk<Message[], string>(
  "chat/fetchMessages",
  async (chatId: string) => {
    const response = await axiosInstance.get(`/messages/${chatId}`);
    return response.data;
  },
);

export const fetchConversations = createAsyncThunk<Conversation[]>(
  "chat/fetchConversations",
  async () => {
    const response = await axiosInstance.get("/messages/conversations");
    return response.data;
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const incoming = action.payload;

      // Логика оптимистичного обновления (если сообщение уже есть)
      if (incoming._id) {
        const optimisticIndex = state.items.findIndex(
          (msg) =>
            !msg._id &&
            msg.chatId === incoming.chatId &&
            msg.text === incoming.text &&
            msg.sender._id === incoming.sender._id,
        );

        if (optimisticIndex !== -1) {
          state.items[optimisticIndex] = incoming;
        } else {
          // Если дубликат ID — ничего не делаем
          if (state.items.some((msg) => msg._id === incoming._id)) return;
          state.items.push(incoming);
        }
      } else {
        // Если нет ID (новое исходящее) — просто пушим
        state.items.push(incoming);
      }

      // 1. Ищем чат, где sender или receiver совпадает с пользователем чата
      const conversation = state.conversations.find(
        (c) =>
          c.user._id === incoming.sender._id ||
          c.user._id === incoming.receiver,
      );

      if (conversation) {
        // 2. Всегда обновляем последнее сообщение
        conversation.lastMessage = incoming.text;

        // 3. Увеличиваем счетчик только если отправитель НЕ является текущим пользователем
        if (conversation.user._id === incoming.sender._id) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (c) => c.user._id === action.payload,
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // 🔥 Вот сюда мы аккуратно вставили обновленный кейс:
      .addCase(fetchConversations.fulfilled, (state, action) => {
        // Просто сохраняем то, что прислал бэк (включая unreadCount из базы)
        state.conversations = action.payload;
      });
  },
});

export const { addMessage, markAsRead } = chatSlice.actions;
export default chatSlice.reducer;
