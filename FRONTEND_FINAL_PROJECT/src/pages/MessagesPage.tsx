import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemButton,
  Avatar,
  Paper,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { fetchMessages, addMessage, Message } from "../redux/chat/chatSlice";
import { RootState } from "../redux/store";

const MessagesPage = () => {
  const dispatch = useAppDispatch();
  const { items: messages, loading } = useAppSelector(
    (state: RootState) => state.chat,
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (selectedChatId) {
      dispatch(fetchMessages(selectedChatId));
    }
  }, [selectedChatId, dispatch]);

  const handleSend = () => {
    if (!text.trim() || !selectedChatId) return;

    const newMessage: Message = {
      _id: Date.now().toString(),
      text: text,
      chatId: selectedChatId,
      sender: { _id: "my_temp_id", username: "You", avatar: "" },
      receiver: "other_user_id",
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessage(newMessage));
    setText("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#fff",
        border: "1px solid #dbdbdb",
      }}
    >
      {/* ЛЕВАЯ ПАНЕЛЬ: Список чатов */}
      <Box sx={{ width: "350px", borderRight: "1px solid #dbdbdb" }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
          itcareerhub
        </Typography>
        <List>
          <ListItemButton onClick={() => setSelectedChatId("test_chat_id")}>
            <Avatar sx={{ mr: 2 }} />
            <Box>
              <Typography variant="body1">nikiita</Typography>
              <Typography variant="caption" color="text.secondary">
                Sent a message • 2 wk
              </Typography>
            </Box>
          </ListItemButton>
        </List>
      </Box>

      {/* ПРАВАЯ ПАНЕЛЬ: Окно переписки */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Хедер чата */}
        <Box
          sx={{ p: 2, borderBottom: "1px solid #dbdbdb", textAlign: "center" }}
        >
          <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 1 }} />
          <Typography variant="h6">nikiita</Typography>
          <Typography variant="body2" color="text.secondary">
            ICHgram
          </Typography>
        </Box>

        {/* Область сообщений */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto", bgcolor: "#fafafa" }}>
          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : messages.length > 0 ? (
            messages.map((msg: Message) => {
              const isMe = msg.sender.username === "You";
              return (
                <Box
                  key={msg._id}
                  sx={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 4,
                      maxWidth: "60%",
                      bgcolor: isMe ? "#6200ea" : "#fff",
                      color: isMe ? "#fff" : "#000",
                      border: isMe ? "none" : "1px solid #dbdbdb",
                    }}
                  >
                    <Typography>{msg.text}</Typography>
                  </Paper>
                </Box>
              );
            })
          ) : (
            <Typography sx={{ textAlign: "center", mt: 4 }}>
              Выберите чат для начала общения
            </Typography>
          )}
        </Box>

        {/* Поле ввода */}
        <Box
          sx={{ p: 2, borderTop: "1px solid #dbdbdb", display: "flex", gap: 1 }}
        >
          <TextField
            fullWidth
            size="small"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write message..."
            sx={{ borderRadius: 20 }}
          />
          <Button onClick={handleSend} variant="contained">
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MessagesPage;
