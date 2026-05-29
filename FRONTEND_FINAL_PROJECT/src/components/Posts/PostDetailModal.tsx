import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addComment, deletePost } from "../../redux/posts/postsSlice";
import { IPost, IComment } from "../../types/index";
import { IUser } from "../../types/index";

interface PostDetailModalProps {
  open: boolean;
  onClose: () => void;
  post: IPost | null;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  open,
  onClose,
  post,
}) => {
  const dispatch = useAppDispatch();
  const [commentText, setCommentText] = useState("");
  const currentUser = useAppSelector((state) => state.auth.user);

  const livePost =
    useAppSelector((state) =>
      state.posts.items.find((p) => p._id === post?._id),
    ) || post;

  if (!livePost) return null;

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await dispatch(
        addComment({ postId: livePost._id, text: commentText.trim() }),
      ).unwrap();
      setCommentText("");
    } catch (err) {
      console.error("Не удалось отправить комментарий:", err);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
      await dispatch(deletePost(livePost._id));
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const postImage = livePost.imageUrl
    ? livePost.imageUrl.startsWith("http")
      ? livePost.imageUrl
      : `http://localhost:3000/${livePost.imageUrl.replace(/^\//, "")}`
    : "";

  const postAuthorAvatar = livePost.author?.avatar
    ? livePost.author.avatar.startsWith("http")
      ? livePost.author.avatar
      : `http://localhost:3000/${livePost.author.avatar.replace(/^\//, "")}`
    : "";

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="post-detail-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", md: "900px" },
          height: { xs: "auto", md: "600px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: "12px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          outline: "none",
        }}
      >
        <Box
          sx={{
            flex: 1.2,
            bgcolor: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: { xs: "300px", md: "100%" },
          }}
        >
          {postImage && (
            <img
              src={postImage}
              alt="Post content"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "400px" },
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #efefef",
            bgcolor: "#ffffff",
            height: { xs: "350px", md: "100%" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid #efefef",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar src={postAuthorAvatar} sx={{ width: 36, height: 36 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {livePost.author?.username || "Пользователь"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              {currentUser?._id === livePost.author?._id && (
                <IconButton
                  onClick={handleDeletePost}
                  size="small"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {livePost.caption && (
              <Typography
                variant="body2"
                sx={{ mb: 2, wordBreak: "break-word" }}
              >
                <strong>{livePost.author?.username}</strong> {livePost.caption}
              </Typography>
            )}

            {livePost.comments?.map((c: IComment) => {
              const rawUser = c.user as unknown;

              // Проверяем, является ли пользователь объектом с username
              const isPopulated =
                rawUser && typeof rawUser === "object" && "username" in rawUser;

              // Теперь используем IUser для типизации
              const commentUser = isPopulated ? (rawUser as IUser) : null;

              return (
                <Box key={c._id} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                  <Typography variant="body2">
                    {/* Теперь commentUser типизирован через IUser, ошибки не будет */}
                    <strong>{commentUser?.username || "Аноним"}</strong>{" "}
                    {c.text}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #efefef", display: "flex" }}>
            <TextField
              fullWidth
              placeholder="Добавьте комментарий..."
              variant="standard"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              onClick={handleSendComment}
              disabled={!commentText.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PostDetailModal;
