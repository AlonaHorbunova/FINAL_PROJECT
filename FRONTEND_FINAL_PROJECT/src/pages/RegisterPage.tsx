import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { registerUser } from "../redux/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  [key: string]: string; // Вместо any используем конкретные типы
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  // Следим за токеном: как только он появился — летим на главную
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // 2. Передаем этот интерфейс в useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  // 3. Теперь здесь не any, а наш интерфейс — ошибка исчезнет!
  const onSubmit = (data: RegisterFormData) => {
    dispatch(registerUser(data));
  };
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 4, width: "100%", textAlign: "center" }}
        >
          <Typography variant="h4" sx={{ mb: 3, fontFamily: "cursive" }}>
            Instagram
          </Typography>

          {/* Если сервер вернул ошибку, покажем её здесь */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              {...register("email", { required: "Введите email" })}
              margin="normal"
              fullWidth
              label="Эл. адрес"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message as string}
            />
            <TextField
              {...register("username", {
                required: "Введите имя пользователя",
              })}
              margin="normal"
              fullWidth
              label="Имя пользователя"
              size="small"
              error={!!errors.username}
              helperText={errors.username?.message as string}
            />
            <TextField
              {...register("password", {
                required: "Введите пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              margin="normal"
              fullWidth
              label="Пароль"
              type="password"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message as string}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading} // Кнопка отключается, пока идет запрос
              sx={{ mt: 3, mb: 2, textTransform: "none", fontWeight: "bold" }}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
