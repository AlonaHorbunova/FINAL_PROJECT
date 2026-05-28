import React, { useEffect, useState } from "react"; // ИЗМЕНЕНО: Добавлен useState
import {
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  Link,
  Typography,
  IconButton, // ДОБАВЛЕНО
  InputAdornment, // ДОБАВЛЕНО
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loginUser } from "../redux/auth/authSlice";

// БЕЗОПАСНЫЙ ИМПОРТ ИКОНОК ДЛЯ MUI v6
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface LoginFormData {
  email: string;
  password: string;
  [key: string]: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((state) => state.auth);

  // ДОБАВЛЕНО: Состояние для показа/скрытия пароля
  const [showPassword, setShowPassword] = useState(false);

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
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#ffffff",
        gap: "32px",
        px: 2,
      }}
    >
      {/* ЛЕВАЯ ЧАСТЬ: ТЕЛЕФОН */}
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
        <Box
          component="img"
          src="/content-phone.png"
          alt="Phone Content"
          sx={{
            position: "absolute",
            top: "45px",
            left: "120px",
            width: "215px",
            height: "460px",
            objectFit: "cover",
            borderRadius: "24px",
          }}
        />
      </Box>

      {/* ПРАВАЯ ЧАСТЬ: ФОРМА АВТОРИЗАЦИИ */}
      <Box sx={{ display: "flex", flexDirection: "column", width: "350px" }}>
        <Paper
          variant="outlined"
          sx={{
            width: "350px",
            pt: "30px",
            px: "40px",
            pb: "25px",
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

            {/* ИНПУТ ЛОГИНА */}
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

            {/* ИНПУТ ПАРОЛЯ (ИЗМЕНЕНО: Добавлен глазик) */}
            <TextField
              {...register("password", { required: "Введите пароль" })}
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
                  pr: "4px", // Смещение для размещения иконки внутри 36px
                  "& fieldset": { borderColor: "#dbdbdb" },
                  "&:hover fieldset": { borderColor: "#dbdbdb" },
                  "&.Mui-focused fieldset": { borderColor: "#a8a8a8" },
                },
                "& .MuiInputBase-input": { padding: "9px 8px" },
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              mt: "28.4px",
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
