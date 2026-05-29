import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutlined as ChatBubbleOutlineIcon,
  Send as PaperPlaneIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Box } from "@mui/system";
import { IPost } from "../../types/index";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleLikePost, deletePost } from "../../redux/posts/postsSlice";

interface PostCardProps {
  post: IPost;
  onOpenModal?: (post: IPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onOpenModal }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const BACKEND_URL = "http://localhost:3000";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentUser = useAppSelector((state) => state.auth.user);

  const authorId =
    typeof post.author === "object" ? post.author?._id : post.author;
  const isOwner = currentUser?._id === authorId;

  const isLiked = currentUser
    ? (post.likes || []).includes(currentUser._id)
    : false;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDelete = () => {
    if (window.confirm("Удалить этот пост?")) {
      dispatch(deletePost(post._id));
    }
    handleMenuClose();
  };

  const handleLike = () => {
    if (!currentUser?._id) return;
    dispatch(toggleLikePost({ postId: post._id, userId: currentUser._id }));
  };

  const handleNavigateToProfile = () => {
  if (!authorId) return;

  if (authorId === currentUser?._id) {
    navigate("/profile");
  } else {
    navigate(`/profile/${authorId}`);
  }
};

  const getFullUrl = (urlPath: string | undefined) => {
    if (!urlPath) return "";
    if (urlPath.startsWith("http")) return urlPath;
    return `${BACKEND_URL}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
  };

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        mb: 4,
        borderRadius: 2,
        border: "1px solid #dbdbdb",
        boxShadow: "none",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={getFullUrl(post.author?.avatar)}
            alt={post.author?.username}
            onClick={handleNavigateToProfile}
            sx={{ width: 32, height: 32, cursor: "pointer" }}
          >
            {post.author?.username?.[0]?.toUpperCase()}
          </Avatar>
        }
        action={
          <>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {isOwner && (
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Удалить
                </MenuItem>
              )}
              <MenuItem onClick={handleMenuClose}>Отмена</MenuItem>
            </Menu>
          </>
        }
        title={
          <Typography
            onClick={handleNavigateToProfile}
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {post.author?.username || "Пользователь"}
          </Typography>
        }
        sx={{ p: 1.5 }}
      />

      <CardMedia
        component="img"
        image={getFullUrl(post.imageUrl)}
        alt="Публикация"
        onClick={() => onOpenModal && onOpenModal(post)}
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          objectFit: "cover",
          bgcolor: "#fafafa",
          cursor: "pointer",
        }}
      />

      <Box
        sx={{ display: "flex", justifyContent: "space-between", px: 1, pt: 1 }}
      >
        <Box>
          <IconButton onClick={handleLike}>
            {isLiked ? (
              <FavoriteIcon sx={{ color: "#ed4956" }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: "#262626" }} />
            )}
          </IconButton>
          <IconButton onClick={() => onOpenModal && onOpenModal(post)}>
            <ChatBubbleOutlineIcon sx={{ color: "#262626" }} />
          </IconButton>
          <IconButton
            onClick={() => navigate(`/messages?targetId=${authorId}`)}
          >
            <PaperPlaneIcon sx={{ color: "#262626" }} />
          </IconButton>
        </Box>
        <IconButton>
          <BookmarkBorderIcon sx={{ color: "#262626" }} />
        </IconButton>
      </Box>

      <CardContent sx={{ px: 2, py: 0.5, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          {post.likes?.length || 0} отметок "Нравится"
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#262626", fontSize: "0.9rem" }}
        >
          <Box
            component="span"
            onClick={handleNavigateToProfile}
            sx={{ fontWeight: 600, mr: 1, cursor: "pointer" }}
          >
            {post.author?.username}
          </Box>
          {post.caption}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PostCard;
