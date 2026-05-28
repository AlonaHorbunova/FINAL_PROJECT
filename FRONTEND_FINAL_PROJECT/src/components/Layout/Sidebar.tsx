import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Drawer,
  TextField,
  Divider,
  Badge,
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
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/auth/authSlice";
import CreatePostModal from "../Posts/CreatePostModal";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Получаем список бесед из Redux
  const conversations = useAppSelector((state) => state.chat.conversations);

  // Считаем общее число непрочитанных
  const totalUnreadMessages = conversations.reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0,
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<
    "search" | "notifications" | null
  >(null);

  // Динамический массив меню
  const menuItems = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Search", icon: <Search />, path: "/search" },
    { text: "Explore", icon: <Explore />, path: "/explore" },
    {
      text: "Messages",
      icon: (
        <Badge badgeContent={totalUnreadMessages} color="error" max={99}>
          <Chat />
        </Badge>
      ),
      path: "/messages",
    },
    { text: "Notifications", icon: <FavoriteBorder />, path: "/notifications" },
    { text: "Create", icon: <AddBox />, path: "/create" },
    { text: "Profile", icon: <AccountCircle />, path: "/profile" },
  ];

  const handleItemClick = (path: string, text: string) => {
    if (text === "Create") {
      setIsModalOpen(true);
      return;
    }

    if (text === "Search") {
      setActivePanel(activePanel === "search" ? null : "search");
      return;
    }

    if (text === "Notifications") {
      setActivePanel(activePanel === "notifications" ? null : "notifications");
      return;
    }

    setActivePanel(null);
    navigate(path);
  };

  return (
    <>
      {/* САТЕЛИЙНЫЙ САЙДБАР */}
      <Box
        sx={{
          width: 244,
          borderRight: "1px solid #dbdbdb",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          pt: "40px",
          pb: "20px",
          px: "25px",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          zIndex: 1400,
          boxSizing: "border-box",
        }}
      >
        {/* ЛОГОТИП */}
        <Box sx={{ px: "8px", mb: "30px" }}>
          <img
            src="/ichgram.png"
            alt="ICHGRAM"
            style={{
              width: "103px",
              height: "auto",
              display: "block",
            }}
          />
        </Box>

        {/* ОСНОВНОЕ МЕНЮ */}
        <List sx={{ flexGrow: 1, p: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleItemClick(item.path, item.text)}
                sx={{
                  borderRadius: 2,
                  px: "12px",
                  bgcolor:
                    (item.text === "Search" && activePanel === "search") ||
                    (item.text === "Notifications" &&
                      activePanel === "notifications")
                      ? "#f2f2f2"
                      : "transparent",
                }}
              >
                <ListItemIcon sx={{ color: "black", minWidth: "40px" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: "15px",
                      fontWeight: "500",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* КНОПКА ВЫХОДА ВНИЗУ */}
        <List sx={{ p: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => dispatch(logout())}
              sx={{ borderRadius: 2, px: "12px", color: "error.main" }}
            >
              <ListItemIcon sx={{ color: "error.main", minWidth: "40px" }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "15px",
                    fontWeight: "500",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* ШТОРКА ПОИСКА */}
      <Drawer
        anchor="left"
        open={activePanel === "search"}
        onClose={() => setActivePanel(null)}
        variant="temporary"
        sx={{
          "& .MuiBackdrop-root": { left: 244 },
          "& .MuiDrawer-paper": {
            width: 637,
            pl: "274px",
            pr: 4,
            pt: 4,
            borderRight: "1px solid #dbdbdb",
            boxShadow: "none",
            zIndex: 1300,
          },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Поиск
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск"
          size="small"
          sx={{
            bgcolor: "#efefef",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
            },
            mb: 2,
          }}
        />
        <Divider />
        <Box sx={{ mt: 2, color: "gray", fontSize: "0.9rem" }}>
          Недавние запросы отсутствуют.
        </Box>
      </Drawer>

      {/* ШТОРКА УВЕДОМЛЕНИЙ */}
      <Drawer
        anchor="left"
        open={activePanel === "notifications"}
        onClose={() => setActivePanel(null)}
        variant="temporary"
        sx={{
          "& .MuiBackdrop-root": { left: 244 },
          "& .MuiDrawer-paper": {
            width: 637,
            pl: "274px",
            pr: 4,
            pt: 4,
            borderRight: "1px solid #dbdbdb",
            boxShadow: "none",
            zIndex: 1300,
          },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Уведомления
        </Typography>
        <Divider />
        <Box sx={{ mt: 2, color: "gray", fontSize: "0.9rem" }}>
          Здесь будут отображаться лайки и комментарии.
        </Box>
      </Drawer>

      <CreatePostModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
