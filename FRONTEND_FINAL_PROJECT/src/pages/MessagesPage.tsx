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
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PaperPlaneIcon from "@mui/icons-material/Telegram";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  addMessage,
  fetchMessages,
  fetchConversations,
} from "../redux/chat/chatSlice";
import { fetchUserById, clearProfile } from "../redux/user/userSlice";
import { socket } from "../api/socket";
import { Message } from "../redux/chat/chatSlice";

const MessagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = searchParams.get("targetId");

  const { user: currentUser, loading: isAuthLoading } = useAppSelector(
    (state) => state.auth,
  );
  const { profileUser, loading: isUserLoading } = useAppSelector(
    (state) => state.user,
  );
  const conversations = useAppSelector((state) => state.chat.conversations);
  const allMessages = useAppSelector((state) => state.chat.items);

  const activeChatUser = targetId
    ? profileUser || conversations.find((c) => c.user._id === targetId)?.user
    : null;

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // СОХРАНЯЕМ TARGET_ID И CURRENT_USER В REF, ЧТОБЫ СОКЕТЫ НЕ СПАМИЛИ ПРИ ИХ ИЗМЕНЕНИИ
  const targetIdRef = useRef(targetId);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    targetIdRef.current = targetId;
  }, [targetId]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // 1. ВХОД В КОМНАТУ СОКЕТА (Строго один раз при монтировании, если юзер есть)
  useEffect(() => {
    if (currentUser?._id) {
      console.log("🟢 Инициализация сокет-комнаты для:", currentUser._id);
      socket.emit("join", currentUser._id);
    }
  }, [currentUser?._id]);

  // 2. СЛУШАТЕЛЬ ВХОДЯЩИХ СООБЩЕНИЙ (Навешивается ОДИН раз, зависимости пустые!)
  useEffect(() => {
    if (!currentUser?._id) return;

    const handleNewMessage = (incomingMsg: Message) => {
      const activeTargetId = targetIdRef.current;
      const activeCurrentUser = currentUserRef.current;

      if (!activeCurrentUser) return;

      const currentChatId = activeTargetId
        ? [activeCurrentUser._id, activeTargetId].sort().join("_")
        : null;

      // Добавляем сообщение, только если оно из текущего открытого чата
      if (incomingMsg.chatId === currentChatId) {
        dispatch(addMessage(incomingMsg));
      }

      // Обновляем список чатов в боковой панели
      dispatch(fetchConversations());
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      console.log("🔴 Отключение слушателя сообщений");
      socket.off("new_message", handleNewMessage);
    };
  }, [dispatch, currentUser?._id]); // Слушатель зависит только от факта наличия авторизации, а не от переключения чатов

  // Очистка выбранного пользователя при клике на вкладку "Сообщения"
  useEffect(() => {
    if (!targetId) {
      dispatch(clearProfile());
    }
  }, [targetId, dispatch]);

  // 3. ЗАГРУЗКА СПИСКА ЧАТОВ ПРИ СТАРТЕ
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchConversations());
    }
  }, [currentUser, dispatch]);

  // 4. ЗАГРУЗКА ДАННЫХ ДИАЛОГА ПРИ СМЕНЕ СОБЕСЕДНИКА
  useEffect(() => {
    if (targetId && currentUser) {
      dispatch(fetchUserById(targetId));
      const chatId = [currentUser._id, targetId].sort().join("_");
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

    setTimeout(() => dispatch(fetchConversations()), 200);
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

  if (isAuthLoading || !currentUser?._id) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="gray">
          Синхронизация профиля...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#ffffff",
        width: "100%",
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: Динамический список чатов */}
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
          {conversations.length > 0 ? (
            conversations.map((chat) => {
              const isSelected = targetId === chat.user._id;
              return (
                <ListItem disablePadding key={chat.user._id}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSearchParams({ targetId: chat.user._id })}
                    sx={{
                      p: 2,
                      "&.Mui-selected": { bgcolor: "#f5f5f5" },
                      "&:hover": { bgcolor: "#fafafa" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={getFullUrl(chat.user.avatar)}
                        alt={chat.user.username}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          component="span"
                          sx={{ fontWeight: 600, fontSize: "14px" }}
                        >
                          {chat.user.username}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          component="p"
                          noWrap
                          sx={{ fontSize: "12px", color: "gray" }}
                        >
                          {chat.lastMessage}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <Box sx={{ p: 3, textAlign: "center", color: "gray" }}>
              <Typography variant="body2">
                У вас пока нет активных чатов.
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
        {targetId && isUserLoading && !activeChatUser ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : activeChatUser ? (
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
            }}
          >
            <PaperPlaneIcon sx={{ fontSize: 96, color: "#262626", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 300, mb: 1 }}>
              Ваши сообщения
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              Выберите чат слева, чтобы начать общение.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessagesPage;
