import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  Link,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { registerUser } from "../redux/auth/authSlice";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface RegisterFormData {
  email: string;
  fullName: string;
  username: string;
  password: string;
  [key: string]: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  const [isSuccess, setIsSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    };

    try {
      await dispatch(registerUser(payload)).unwrap();
      setIsSuccess(true);
    } catch (err) {
      console.error("Ошибка при регистрации в компоненте:", err);
    }
  };

  if (isSuccess) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#ffffff",
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", width: "350px" }}>
          <Paper
            variant="outlined"
            sx={{
              width: "350px",
              pt: "40px",
              px: "40px",
              pb: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderColor: "#dbdbdb",
              borderRadius: "1px",
              boxShadow: "none",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <img
              src="/ichgram.png"
              alt="ICHGRAM"
              style={{
                width: "190px",
                height: "106.87px",
                objectFit: "fill",
                display: "block",
                marginBottom: "20px",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontSize: "16px",
                fontWeight: "600",
                mb: "10px",
                color: "#262626",
              }}
            >
              You have been successfully registered!
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: "12px",
                color: "#8e8e8e",
                mb: "25px",
                lineHeight: "18px",
              }}
            >
              Click the button below to sign in.
            </Typography>

            <Button
              component={RouterLink}
              to="/login"
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
                "&:hover": { bgcolor: "#1877f2", boxShadow: "none" },
              }}
            >
              Sign in
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#ffffff",
        px: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", width: "350px" }}>
        <Paper
          variant="outlined"
          sx={{
            width: "350px",
            pt: "40px",
            px: "40px",
            pb: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderColor: "#dbdbdb",
            borderRadius: "1px",
            boxShadow: "none",
            boxSizing: "border-box",
          }}
        >
          <img
            src="/ichgram.png"
            alt="ICHGRAM"
            style={{
              width: "190px",
              height: "106.87px",
              objectFit: "fill",
              display: "block",
            }}
          />

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ width: "100%" }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 1, py: 0, fontSize: "11px" }}>
                {error}
              </Alert>
            )}

            {/* ИНПУТ 1: Эл. адрес */}
            <TextField
              {...register("email", { required: "Введите email или телефон" })}
              fullWidth
              placeholder="Email"
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
                "& .MuiInputBase-input": { padding: "9px 8px !important" },
              }}
            />

            {/* ИНПУТ 2: Имя и фамилия */}
            <TextField
              {...register("fullName", { required: "Введите имя и фамилию" })}
              fullWidth
              placeholder="Full Name"
              size="small"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
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
                "& .MuiInputBase-input": { padding: "9px 8px !important" },
              }}
            />

            {/* ИНПУТ 3: Имя пользователя */}
            <TextField
              {...register("username", {
                required: "Введите имя пользователя",
                minLength: {
                  value: 4,
                  message: "This username is already taken. Try another.",
                },
              })}
              autoComplete="username"
              fullWidth
              placeholder="Username"
              size="small"
              error={!!errors.username}
              helperText={errors.username?.message}
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
                "& .MuiInputBase-input": { padding: "9px 8px !important" },
              }}
            />

            {/* ИНПУТ 4: Пароль (ИЗМЕНЕНО: Добавлен глазик) */}
            <TextField
              {...register("password", {
                required: "Введите пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              autoComplete="new-password"
              fullWidth
              placeholder="Password"
              type={showPassword ? "text" : "password"} // Динамический тип
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                mb: "14px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  bgcolor: "#fafafa",
                  fontSize: "12px",
                  pr: "4px",
                  "& fieldset": { borderColor: "#dbdbdb" },
                  "&:hover fieldset": { borderColor: "#dbdbdb" },
                  "&.Mui-focused fieldset": { borderColor: "#a8a8a8" },
                },
                "& .MuiInputBase-input": { padding: "9px 8px !important" },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: "18px" }} />
                        ) : (
                          <Visibility sx={{ fontSize: "18px" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Typography
              variant="body2"
              sx={{
                fontSize: "11px",
                color: "#8e8e8e",
                textAlign: "center",
                mb: "12px",
                lineHeight: "16px",
              }}
            >
              People who use our service may have uploaded your contact
              information to ICHGRAM.{" "}
              <Link
                href="#"
                sx={{
                  color: "#385185",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Learn more
              </Link>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontSize: "11px",
                color: "#8e8e8e",
                textAlign: "center",
                mb: "20px",
                lineHeight: "16px",
              }}
            >
              By registering, you agree to our{" "}
              <Link href="#" sx={{ color: "#385185", textDecoration: "none" }}>
                Terms of Service
              </Link>
              ,{" "}
              <Link href="#" sx={{ color: "#385185", textDecoration: "none" }}>
                Privacy Policy
              </Link>{" "}
              и{" "}
              <Link href="#" sx={{ color: "#385185", textDecoration: "none" }}>
                Cookie Policy
              </Link>
              .
            </Typography>

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
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            width: "350px",
            height: "63px",
            mt: "10px",
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
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: "#0095f6",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterPage;
