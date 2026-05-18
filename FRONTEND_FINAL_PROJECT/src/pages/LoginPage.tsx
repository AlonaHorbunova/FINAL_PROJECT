import React, { useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  Link,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loginUser } from "../redux/auth/authSlice";

interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginUser(data));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // Выравнивает форму и телефон строго по центру экрана
        minHeight: "100vh",
        bgcolor: "#ffffff",
        gap: "32px",
        px: 2,
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: КОМПОЗИТНЫЙ ТЕЛЕФОН С НАПОЛНЕНИЕМ */}
      <Box
        sx={{
          position: "relative",
          width: "380.32px",
          height: "581.25px",
          display: { xs: "none", md: "block" },
          backgroundImage: "url('/auth-phone.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* КАРТИНКА НАПОЛНЕНИЯ ТЕЛЕФОНА (СКРИНШОТ) */}
        <Box
          component="img"
          src="/content-phone.png"
          alt="Phone Content"
          sx={{
            position: "absolute",
            top: "45px",
            left: "120px", // Отступ слева внутрь экрана
            width: "215px", // Ширина экрана
            height: "460px", // Высота экрана
            objectFit: "cover",
            borderRadius: "24px", // Скругление экрана телефона
          }}
        />
      </Box>

      {/* ПРАВАЯ ЧАСТЬ: СЕТКА ФОРМЫ АВТОРИЗАЦИИ */}
      <Box sx={{ display: "flex", flexDirection: "column", width: "350px" }}>
        {/* ВЕРХНЯЯ РАМКА С ИНПУТАМИ (Строго 350px на 411.98px) */}
        <Paper
          variant="outlined"
          sx={{
            width: "350px",

            pt: "30px", // Отступ сверху до логотипа
            px: "40px", // Отступы по бокам 40px из макета
            pb: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderColor: "#dbdbdb",
            borderRadius: "1px",
            boxShadow: "none",
            boxSizing: "border-box", // Защищает размеры от раздувания из-за padding
          }}
        >
          {/* ЛОГОТИП — Прямой вывод тега img с жесткими размерами */}
          <img
            src="/ichgram.png"
            alt="ICHGRAM"
            style={{
              width: "190px",
              height: "106.87px", // Чуть увеличили высоту контейнера под пропорции файла
              objectFit: "fill", // Насильно растягивает контент картинки на полные 175x60 без сжатия полей
              display: "block",
              // Скорректированный отступ до инпутов, чтобы сохранить общую высоту
            }}
          />

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 1, py: 0, fontSize: "11px" }}>
                {error}
              </Alert>
            )}

            <TextField
              {...register("email", { required: "Введите email" })}
              fullWidth
              placeholder="Username, or email"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                mb: "6px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  bgcolor: "#fafafa",
                  fontSize: "12px",
                  "& fieldset": { borderColor: "#dbdbdb" },
                  "&:hover fieldset": { borderColor: "#dbdbdb" },
                  "&.Mui-focused fieldset": { borderColor: "#a8a8a8" },
                },
                "& .MuiInputBase-input": { padding: "9px 8px" },
              }}
            />

            <TextField
              {...register("password", { required: "Введите пароль" })}
              fullWidth
              placeholder="Password"
              type="password"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                mb: "14px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  bgcolor: "#fafafa",
                  fontSize: "12px",
                  "& fieldset": { borderColor: "#dbdbdb" },
                  "&:hover fieldset": { borderColor: "#dbdbdb" },
                  "&.Mui-focused fieldset": { borderColor: "#a8a8a8" },
                },
                "& .MuiInputBase-input": { padding: "9px 8px" },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: "32px",
                bgcolor: "#0095f6",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "none",
                "&:hover": { bgcolor: "#1877f2", boxShadow: "none" },
              }}
            >
              {loading ? "Вход..." : "Log in"}
            </Button>
          </Box>

          {/* Разделитель OR (ИЛИ) — Отступ сверху ровно 28.4px */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              mt: "28.4px", // Идеальный отступ по твоему замеру
              mb: "24px",
            }}
          >
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#dbdbdb" }} />
            <Typography
              sx={{
                mx: 2,
                fontSize: "12px",
                fontWeight: "600",
                color: "#8e8e8e",
              }}
            >
              OR
            </Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#dbdbdb" }} />
          </Box>

          {/* Ссылка "Забыли пароль?" */}
          <Link
            component={RouterLink}
            to="/reset"
            sx={{
              fontSize: "12px",
              color: "#385185",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              pt: "40px",
            }}
          >
            Forgot password?
          </Link>
        </Paper>

        {/* НИЖНЯЯ РАМКА (350px на 63px, зазор 10px) */}
        <Paper
          variant="outlined"
          sx={{
            width: "350px",
            height: "63px",
            mt: "10px", // Фиксированный зазор 10px
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderColor: "#dbdbdb",
            borderRadius: "1px",
            boxShadow: "none",
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ fontSize: "14px", color: "#262626" }}>
            Don't have an account?{" "}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: "#0095f6",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
