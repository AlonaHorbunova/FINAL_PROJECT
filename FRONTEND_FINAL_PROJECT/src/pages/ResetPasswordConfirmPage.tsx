/* eslint-disable react-hooks/incompatible-library */
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { useAppDispatch } from "../redux/hooks";
import { resetPasswordAction } from "../redux/auth/authSlice";

interface ResetPasswordInputs {
  password?: string;
  confirmPassword?: string;
}

const ResetPasswordConfirmPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInputs>();

  const passwordValue = watch("password");

  const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
    if (!token) {
      setStatus({
        type: "error",
        text: "Токен сброса пароля отсутствует или недействителен.",
      });
      return;
    }

    if (!data.password) return;

    setLoading(true);
    setStatus(null);

    const resultAction = await dispatch(
      resetPasswordAction({ token, password: data.password }),
    );
    setLoading(false);

    if (resetPasswordAction.fulfilled.match(resultAction)) {
      setStatus({ type: "success", text: resultAction.payload });
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setStatus({
        type: "error",
        text: (resultAction.payload as string) || "Ошибка сброса пароля",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          width: "350px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "600" }}>
          Create New Password
        </Typography>

        {status && (
          <Alert severity={status.type} sx={{ mb: 2, width: "100%" }}>
            {status.text}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%" }}
        >
          <TextField
            {...register("password", {
              required: "Введите новый пароль",
              minLength: { value: 6, message: "Минимум 6 символов" },
            })}
            fullWidth
            type="password"
            placeholder="New Password"
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 2 }}
          />
          <TextField
            {...register("confirmPassword", {
              required: "Повторите пароль",
              validate: (value) =>
                value === passwordValue || "Пароли не совпадают",
            })}
            fullWidth
            type="password"
            placeholder="Confirm New Password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "#0095f6" }}
          >
            {loading ? "Updating..." : "Save Password"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordConfirmPage;
