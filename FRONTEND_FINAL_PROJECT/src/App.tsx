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
import ResetPasswordConfirmPage from "./pages/ResetPasswordConfirmPage"; // Импорт новой страницы
import ProfilePage from "./pages/ProfilePage";
import { addMessage } from "./redux/chat/chatSlice";
import MessagesPage from "./pages/MessagesPage";
import { getMe } from "./redux/auth/authSlice";
import { socket } from "./api/socket";

function App() {
  const { token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  // Эффект для сокетов
  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);

      socket.on("new_message", (message) => {
        dispatch(addMessage(message));
        console.log("Новое сообщение:", message);
      });
    }

    return () => {
      socket.off("new_message");
    };
  }, [user?._id, dispatch]);

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
          ml: token ? "240px" : 0,
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

          {/* Защищенные роуты (доступны только с токеном) */}
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
