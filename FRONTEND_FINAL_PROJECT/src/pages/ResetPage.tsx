import React from "react";
import { Box, Button, TextField, Paper, Typography, Link } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { forgotPassword } from "../redux/auth/authSlice";
import { AppDispatch } from "../redux/store";

interface ResetFormData {
  identity: string;
}

const ResetPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>();

  // ОБНОВЛЕННАЯ ФУНКЦИЯ ОНСАБМИТ С .unwrap()
  const onSubmit = async (data: ResetFormData) => {
    console.log("Данные для сброса пароля:", data);

    try {
      await dispatch(forgotPassword(data.identity)).unwrap();

      alert("Инструкция по сбросу пароля отправлена на ваш Email!");
      navigate("/login");
    } catch (error: unknown) {
      console.error("Полная ошибка с сервера в компоненте:", error);

      // Приводим к объекту, у которого может быть необязательное свойство message
      const typedError = error as { message?: string };

      const errorMessage =
        typedError?.message ||
        "Ошибка сервера (500). Проверьте терминал бэкенда!";
      alert(`Произошла ошибка: ${errorMessage}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#ffffff",
      }}
    >
      {/* ВЕРХНЯЯ ПАНЕЛЬ (HEADER) */}
      <Box
        sx={{
          height: "60px",
          borderBottom: "1px solid #dbdbdb",
          display: "flex",
          alignItems: "center",
          px: 4,
        }}
      >
        <img
          src="/ichgram.png"
          alt="ICHGRAM"
          style={{ width: "100px", objectFit: "contain" }}
        />
      </Box>

      {/* ОСНОВНОЙ КОНТЕНТ ЦЕНТРИРОВАННЫЙ */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", width: "350px" }}>
          <Paper
            variant="outlined"
            sx={{
              pt: "24px",
              px: "40px",
              pb: "0px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderColor: "#dbdbdb",
              borderRadius: "1px",
              boxShadow: "none",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Иконка замка в круге */}
            <Box
              sx={{
                width: "96px",
                height: "96px",
                border: "2px solid #262626",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: "16px",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: "50px", color: "#262626" }} />
            </Box>

            {/* Заголовок */}
            <Typography
              variant="h6"
              sx={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#262626",
                mb: "12px",
                textAlign: "center",
              }}
            >
              Trouble logging in?
            </Typography>

            {/* Описание проблемы */}
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#8e8e8e",
                textAlign: "center",
                mb: "20px",
                lineHeight: "18px",
              }}
            >
              Enter your email, phone, or username and we'll send you a link to
              get back into your account.
            </Typography>

            {/* Форма */}
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ width: "100%" }}
            >
              <TextField
                {...register("identity", {
                  required: "Поле обязательно для заполнения",
                })}
                fullWidth
                placeholder="Email or Username"
                size="small"
                error={!!errors.identity}
                helperText={errors.identity?.message}
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
                  "& .MuiInputBase-input": { padding: "9px 8px !important" },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  height: "32px",
                  bgcolor: "#0095f6",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  boxShadow: "none",
                  mb: "40px",
                  "&:hover": { bgcolor: "#1877f2", boxShadow: "none" },
                }}
              >
                Reset your password
              </Button>
            </Box>

            {/* РАЗДЕЛИТЕЛЬ С СЛОВОМ OR */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                mb: "40px",
              }}
            >
              <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#dbdbdb" }} />
              <Typography
                variant="body2"
                sx={{
                  mx: 2,
                  color: "#8e8e8e",
                  fontWeight: "600",
                  fontSize: "12px",
                }}
              >
                OR
              </Typography>
              <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#dbdbdb" }} />
            </Box>

            {/* Ссылка на создание нового аккаунта */}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                fontSize: "14px",
                color: "#262626",
                fontWeight: "600",
                textDecoration: "none",
                mb: "60px",
                "&:hover": { color: "#8e8e8e" },
              }}
            >
              Create new account
            </Link>

            {/* НИЖНЯЯ КНОПКА НАЗАД К ЛОГИНУ */}
            <Box
              sx={{
                width: "calc(100% + 80px)",
                mx: "-40px",
                height: "44px",
                bgcolor: "#fafafa",
                borderTop: "1px solid #dbdbdb",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  fontSize: "14px",
                  color: "#262626",
                  fontWeight: "600",
                  textDecoration: "none",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                Back to login
              </Link>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPage;
