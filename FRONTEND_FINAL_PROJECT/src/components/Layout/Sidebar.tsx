import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Home,
  Search,
  Explore,
  Chat,
  FavoriteBorder,
  AddBox,
  AccountCircle,
  ExitToApp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/hooks"; // Путь на два уровня вверх к хукам
import { logout } from "../../redux/auth/authSlice"; // Путь к слайсу

const menuItems = [
  { text: "Home", icon: <Home />, path: "/" },
  { text: "Search", icon: <Search />, path: "/search" },
  { text: "Explore", icon: <Explore />, path: "/explore" },
  { text: "Messages", icon: <Chat />, path: "/messages" },
  { text: "Notifications", icon: <FavoriteBorder />, path: "/notifications" },
  { text: "Create", icon: <AddBox />, path: "/create" },
  { text: "Profile", icon: <AccountCircle />, path: "/profile" },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        width: 240,
        borderRight: "1px solid #dbdbdb",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 4, fontFamily: "cursive", px: 2, fontWeight: "bold" }}
      >
        ICHGRAM
      </Typography>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ color: "black" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Кнопка выхода внизу сайдбара */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => dispatch(logout())}
            sx={{ borderRadius: 2, color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
