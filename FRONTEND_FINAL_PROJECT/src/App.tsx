import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "./components/Layout/Sidebar";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import ResetPage from "./pages/ResetPage";
import ResetPasswordConfirmPage from "./pages/ResetPasswordConfirmPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import { getMe } from "./redux/auth/authSlice";
import {
  addMessage,
  fetchConversations,
  Message,
} from "./redux/chat/chatSlice";
import {
  fetchNotificationsThunk,
  addNotification,
  INotification, // 🔥 Импортируем тип уведомления для строгой типизации
} from "./redux/notification/notificationSlice";
import { socket } from "./api/socket";

function App() {
  const { token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // 1. Проверка профиля при наличии токена
  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  // 2. Глобальная загрузка данных чата и уведомлений при входе на сайт
  useEffect(() => {
    if (token && user?._id) {
      dispatch(fetchConversations());
      dispatch(fetchNotificationsThunk()); // 🔥 Первично стягиваем историю уведомлений из БД
    }
  }, [token, user?._id, dispatch]);

  // 3. Глобальный слушатель сокетов (Сообщения + Уведомления)
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      console.log("🟢 Инициализация сокета для юзера:", userId);
      socket.emit("join", userId);

      // Слушатель новых сообщений
      const handleNewMessage = (message: Message) => {
        console.log("📩 [Глобальный Сокет] Поймал сообщение:", message);
        dispatch(addMessage(message));
      };

      // 🔥 Слушатель новых уведомлений (Лайки, комменты, подписки)
      const handleNewNotification = (notification: INotification) => {
        console.log("🔔 [Глобальный Сокет] Поймал уведомление:", notification);
        dispatch(addNotification(notification));
      };

      socket.on("new_message", handleNewMessage);
      socket.on("new_notification", handleNewNotification); // 🔥 Начинаем слушать бэкенд

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("new_notification", handleNewNotification); // 🔥 Чистим за собой при размонтировании
      };
    }
  }, [userId, dispatch]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {token && <Sidebar />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#fafafa",
          minHeight: "100vh",
          ml: token ? "240px" : 0, // Убедись, что отступ совпадает с шириной твоего Сайдбара (244px в нашем Sidebar.tsx)
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={!token ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!token ? <RegisterPage /> : <Navigate to="/" />}
          />

          {/* Публичные страницы для сброса пароля */}
          <Route path="/reset" element={<ResetPage />} />
          <Route
            path="/reset-password-confirm/:token"
            element={<ResetPasswordConfirmPage />}
          />

          {/* Защищенные роуты */}
          <Route
            path="/"
            element={token ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/explore"
            element={token ? <ExplorePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={token ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:id"
            element={token ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/messages"
            element={token ? <MessagesPage /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
