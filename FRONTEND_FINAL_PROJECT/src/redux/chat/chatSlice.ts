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

// Загрузка сообщений конкретного чата
export const fetchMessages = createAsyncThunk<Message[], string>(
  "chat/fetchMessages",
  async (chatId: string) => {
    const response = await axiosInstance.get(`/messages/${chatId}`);
    return response.data;
  },
);

// Загрузка списка всех чатов для левой панели
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

      // Если сообщение пришло с бэкенда/сокета (у него уже есть _id)
      if (incoming._id) {
        // Ищем локальное "оптимистичное" сообщение, у которого еще НЕТ _id
        const optimisticIndex = state.items.findIndex(
          (msg) =>
            !msg._id &&
            msg.chatId === incoming.chatId &&
            msg.text === incoming.text &&
            msg.sender._id === incoming.sender._id,
        );

        if (optimisticIndex !== -1) {
          // Нашли! Заменяем временное сообщение полноценным (теперь у него появится _id)
          state.items[optimisticIndex] = incoming;
          return;
        }

        // Дополнительная проверка: если сокет продублировал событие, просто игнорируем
        const isDuplicate = state.items.some((msg) => msg._id === incoming._id);
        if (isDuplicate) return;
      }

      // Если это новое оптимистичное сообщение с фронта или уникальное сообщение от собеседника
      state.items.push(incoming);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(
        fetchConversations.fulfilled,
        (state, action: PayloadAction<Conversation[]>) => {
          state.conversations = action.payload;
        },
      );
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;
