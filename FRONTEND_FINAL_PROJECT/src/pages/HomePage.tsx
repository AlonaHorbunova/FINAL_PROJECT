import { Typography, Container, Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/auth/authSlice";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Добро пожаловать, {user?.username}!</Typography>
      <Typography sx={{ mt: 2 }}>
        Это твоя лента новостей (пока пустая).
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => dispatch(logout())}
        sx={{ mt: 4 }}
      >
        Выйти
      </Button>
    </Container>
  );
};

export default HomePage;
