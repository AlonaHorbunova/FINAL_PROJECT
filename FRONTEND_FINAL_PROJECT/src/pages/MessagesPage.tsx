import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PaperPlaneIcon from "@mui/icons-material/Telegram";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addMessage, fetchMessages } from "../redux/chat/chatSlice";
import { fetchUserById } from "../redux/user/userSlice";
import { socket } from "../api/socket";
import { Message } from "../redux/chat/chatSlice";
import { IUser } from "../types";

const MessagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const targetId = searchParams.get("targetId");

  // ЯВНО ПРОПИСЫВАЕМ ТИПЫ ДЛЯ REDUX, ЧТОБЫ TYPESCRIPT НЕ ПУТАЛ СТЕЙТЫ
  const currentUser = useAppSelector(
    (state: { auth: { user: IUser | null } }) => state.auth.user,
  );

  const { profileUser: activeChatUser } = useAppSelector(
    (state: { user: { profileUser: IUser | null } }) => state.user,
  );

  const allMessages = useAppSelector(
    (state: { chat: { items: Message[] } }) => state.chat.items,
  );

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (targetId && currentUser) {
      // 1. Загружаем данные пользователя, с которым общаемся
      dispatch(fetchUserById(targetId));

      // 2. Генерируем ID чата точно так же, как при отправке сообщения
      const chatId = [currentUser._id, targetId].sort().join("_");

      // 3. Запрашиваем историю переписки из базы данных MongoDB!
      dispatch(fetchMessages(chatId));
    }
  }, [targetId, currentUser, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const currentChatMessages = allMessages.filter((msg: Message) => {
    if (!targetId || !currentUser) return false;
    const isSentByMe =
      msg.sender?._id === currentUser._id && msg.receiver === targetId;
    const isReceivedByMe =
      msg.sender?._id === targetId && msg.receiver === currentUser._id;
    return isSentByMe || isReceivedByMe;
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUser || !targetId) return;

    const messageData = {
      chatId: [currentUser._id, targetId].sort().join("_"),
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      receiver: targetId,
      text: messageText.trim(),
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    dispatch(addMessage(messageData as unknown as Message));
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFullUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return "";
    return avatarPath.startsWith("http")
      ? avatarPath
      : `http://localhost:3000/${avatarPath.replace(/^\//, "")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#ffffff",
        borderLeft: "1px solid #efefef",
        width: "100%",
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: Список чатов */}
      <Box
        sx={{
          width: "350px",
          borderRight: "1px solid #efefef",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #efefef" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {currentUser?.username || "Чаты"}
          </Typography>
        </Box>

        <List sx={{ p: 0, overflowY: "auto", flexGrow: 1 }}>
          {activeChatUser ? (
            <ListItem disablePadding>
              {/* ИСПОЛЬЗУЕМ ListItemButton вместо свойства button */}
              <ListItemButton
                selected={true}
                onClick={() =>
                  setSearchParams({ targetId: activeChatUser._id })
                }
                sx={{
                  p: 2,
                  "&.Mui-selected": { bgcolor: "#f5f5f5" },
                  "&:hover": { bgcolor: "#fafafa" },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={getFullUrl(activeChatUser.avatar)}
                    alt={activeChatUser.username}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#262626",
                      }}
                    >
                      {activeChatUser.username}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      component="p"
                      sx={{ fontSize: "12px", color: "gray" }}
                    >
                      Активный диалог
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ) : (
            <Box sx={{ p: 3, textAlign: "center", color: "gray" }}>
              <Typography variant="body2">
                Перейдите в профиль пользователя, чтобы начать диалог.
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* ПРАВАЯ ЧАСТЬ: Окно переписки */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
        }}
      >
        {activeChatUser ? (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderBottom: "1px solid #efefef",
              }}
            >
              <Avatar
                src={getFullUrl(activeChatUser.avatar)}
                alt={activeChatUser.username}
                sx={{ width: 40, height: 40 }}
              />
              <Typography sx={{ fontWeight: 600 }}>
                {activeChatUser.username}
              </Typography>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {currentChatMessages.map((msg, idx) => {
                const isMe = msg.sender?._id === currentUser?._id;
                return (
                  <Box
                    key={msg._id || idx}
                    sx={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "60%",
                        bgcolor: isMe ? "#3797f0" : "#efefef",
                        color: isMe ? "#ffffff" : "#000000",
                        px: 2,
                        py: 1,
                        borderRadius: isMe
                          ? "18px 18px 0px 18px"
                          : "18px 18px 18px 0px",
                        fontSize: "14px",
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            <Box
              sx={{
                p: 2,
                borderTop: "1px solid #efefef",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Напишите сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "20px", px: 2 },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "#262626",
            }}
          >
            <PaperPlaneIcon sx={{ fontSize: 96, color: "#262626", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 300, mb: 1 }}>
              Ваши сообщения
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Отправляйте личные фото и сообщения другу.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessagesPage;
