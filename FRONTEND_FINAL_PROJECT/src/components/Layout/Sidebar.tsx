import React, { useState, useEffect } from "react";
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
  Avatar,
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
import {
  searchUsersThunk,
  clearSearchResults,
} from "../../redux/user/userSlice";
import CreatePostModal from "../Posts/CreatePostModal";
import { INotification } from "../../redux/notification/notificationSlice";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(
    (state) => state.notifications.notifications,
  );
  const conversations = useAppSelector((state) => state.chat.conversations);
  const searchResults = useAppSelector((state) => state.user.searchResults);

  const totalUnreadMessages = conversations.reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0,
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<
    "search" | "notifications" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (activePanel === "search" && searchQuery.trim() !== "") {
      const delayDebounceFn = setTimeout(() => {
        dispatch(searchUsersThunk(searchQuery));
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      dispatch(clearSearchResults());
    }
  }, [searchQuery, activePanel, dispatch]);

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
      const nextState = activePanel === "search" ? null : "search";
      setActivePanel(nextState);
      if (!nextState) setSearchQuery("");
      return;
    }

    if (text === "Notifications") {
      setActivePanel(activePanel === "notifications" ? null : "notifications");
      return;
    }

    setActivePanel(null);
    navigate(path);
  };

  const handleUserClick = (userId: string) => {
    setActivePanel(null);
    setSearchQuery("");
    navigate(`/profile/${userId}`);
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
        <Box sx={{ px: "8px", mb: "30px" }}>
          <img
            src="/ichgram.png"
            alt="ICHGRAM"
            style={{ width: "103px", height: "auto", display: "block" }}
          />
        </Box>

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
        onClose={() => {
          setActivePanel(null);
          setSearchQuery("");
        }}
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            bgcolor: "#efefef",
            "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" } },
            mb: 2,
          }}
        />
        <Divider />

        <List sx={{ mt: 2, p: 0 }}>
          {searchResults.length > 0 ? (
            searchResults.map((u) => (
              <ListItem key={u._id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleUserClick(u._id)}
                  sx={{ borderRadius: 2, py: 1, px: 1 }}
                >
                  <Avatar
                    src={u.avatar}
                    sx={{ width: 44, height: 44, mr: 2 }}
                  />
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "14px", fontWeight: "600" }}>
                        {u.username}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: "12px", color: "gray" }}>
                        {u.fullName || ""}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ mt: 2, color: "gray", fontSize: "0.9rem", px: 1 }}>
              {searchQuery.trim() !== ""
                ? "Пользователи не найдены."
                : "Недавние запросы отсутствуют."}
            </Box>
          )}
        </List>
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

        <List sx={{ mt: 2, p: 0 }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((n: INotification) => (
              <ListItem key={n._id} disablePadding sx={{ mb: 2 }}>
                <ListItemButton
                  onClick={() => {
                    setActivePanel(null);
                    navigate(`/profile/${n.issuer?._id}`);
                  }}
                  sx={{ borderRadius: 2, py: 1, px: 1 }}
                >
                  <Avatar
                    src={n.issuer?.avatar || "/default-avatar.png"}
                    sx={{ width: 44, height: 44, mr: 2 }}
                  />
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "14px", fontWeight: "600" }}>
                        {`${n.issuer?.username || "Удаленный пользователь"} поставил(а) лайк`}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: "13px", color: "black" }}>
                        {n.type === "like" &&
                          "поставил(а) лайк твоей публикации"}
                        {n.type === "comment" &&
                          "прокомментировал(а) твой пост"}
                        {n.type === "follow" && "подписался(ась) на обновления"}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ mt: 2, color: "gray", fontSize: "0.9rem", px: 1 }}>
              У вас пока нет новых уведомлений.
            </Box>
          )}
        </List>
      </Drawer>

      <CreatePostModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
