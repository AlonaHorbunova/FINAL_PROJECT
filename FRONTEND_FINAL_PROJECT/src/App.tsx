import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "./components/Layout/Sidebar"; // Проверь этот путь!
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { useAppSelector } from "./redux/hooks";

function App() {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Если юзер залогинен, показываем сайдбар всегда */}
      {token && <Sidebar />}

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#fafafa",
          minHeight: "100vh",
          // Если сайдбар есть, отступаем на его ширину (240px)
          ml: token ? "240px" : 0,
        }}
      >
        <Routes>
          {/* Публичные страницы */}
          <Route
            path="/login"
            element={!token ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!token ? <RegisterPage /> : <Navigate to="/" />}
          />

          {/* Защищенные страницы */}
          <Route
            path="/"
            element={token ? <HomePage /> : <Navigate to="/login" />}
          />

          {/* Заглушки, чтобы не было пустых страниц при клике в меню */}
          <Route
            path="/profile"
            element={token ? <div>Profile Page</div> : <Navigate to="/login" />}
          />
          <Route
            path="/messages"
            element={
              token ? <div>Messages Page</div> : <Navigate to="/login" />
            }
          />

          {/* Редирект для всех остальных путей */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
