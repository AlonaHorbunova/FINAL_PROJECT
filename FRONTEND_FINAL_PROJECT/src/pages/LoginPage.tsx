import React, { useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Link,
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

  // Если токен появился — улетаем на главную
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginUser(data));
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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register("email", { required: "Введите email" })}
              margin="normal"
              fullWidth
              label="Эл. адрес или имя пользователя"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              {...register("password", { required: "Введите пароль" })}
              margin="normal"
              fullWidth
              label="Пароль"
              type="password"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, textTransform: "none", fontWeight: "bold" }}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, mt: 2, width: "100%", textAlign: "center" }}
        >
          <Typography variant="body2">
            У вас еще нет аккаунта?{" "}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ fontWeight: "bold", textDecoration: "none" }}
            >
              Зарегистрироваться
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
