import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getMessagesApi } from "../../api/messages";

// Типизация отправителя (как в модели Mongoose)
interface UserPreview {
  _id: string;
  username: string;
  avatar?: string;
}

// Типизация сообщения
export interface Message {
  _id: string;
  chatId: string;
  sender: UserPreview; // Используем UserPreview, так как прилетает populated объект
  receiver: string;
  text: string;
  createdAt: string;
}

// Типизация состояния
interface ChatState {
  items: Message[];
  loading: boolean;
}

const initialState: ChatState = {
  items: [],
  loading: false,
};

export const fetchMessages = createAsyncThunk<Message[], string>(
  "chat/fetchMessages",
  async (chatId: string) => {
    const { data } = await getMessagesApi(chatId);
    return data;
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchMessages.fulfilled,
        (state, action: PayloadAction<Message[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      );
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;
