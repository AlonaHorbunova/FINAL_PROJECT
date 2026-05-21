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
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addComment } from "../../redux/posts/postsSlice";
// Импортируем IUser, чтобы линтер был доволен
import { IPost, IComment, IUser } from "../../types/index";

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
        {/* ЛЕВАЯ КОЛОНКА: Фотография поста */}
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

        {/* ПРАВАЯ КОЛОНКА: Шапка автора, Комментарии и Поле ввода */}
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
          {/* Instagram-шапка автора поста */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              p: 2,
              borderBottom: "1px solid #efefef",
            }}
          >
            <Avatar
              src={postAuthorAvatar}
              alt={livePost.author?.username || "User"}
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#262626" }}
              >
                {livePost.author?.username || "Пользователь"}
              </Typography>

              {/* Описание публикации */}
              {livePost.caption && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4a4a4a",
                    fontSize: "13px",
                    mt: 0.5,
                    wordBreak: "break-word",
                  }}
                >
                  {livePost.caption}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Лента комментариев */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {livePost.comments && livePost.comments.length > 0 ? (
              livePost.comments.map((c: IComment) => {
                // ИСПРАВЛЕНО: Вместо 'any' приводим к 'unknown'.
                // Это законный способ сделать динамическую проверку типов для ESLint.
                const rawUser = c.user as unknown;
                const isPopulated =
                  rawUser &&
                  typeof rawUser === "object" &&
                  "username" in rawUser;
                const commentUser = isPopulated
                  ? (rawUser as IUser)
                  : currentUser;

                const commentAuthorAvatar = commentUser?.avatar
                  ? commentUser.avatar.startsWith("http")
                    ? commentUser.avatar
                    : `http://localhost:3000/${commentUser.avatar.replace(/^\//, "")}`
                  : "";

                return (
                  <Box
                    key={c._id}
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      src={commentAuthorAvatar}
                      alt={commentUser?.username || "User"}
                      sx={{ width: 32, height: 32, fontSize: "12px" }}
                    />
                    <Box sx={{ pt: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#262626", lineHeight: 1.4 }}
                      >
                        <span style={{ fontWeight: 700, marginRight: "8px" }}>
                          {commentUser?.username || "Аноним"}
                        </span>
                        {c.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography variant="body2" sx={{ color: "gray" }}>
                  Нет комментариев. Будьте первым!
                </Typography>
              </Box>
            )}
          </Box>

          {/* Поле ввода комментария */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #efefef",
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              placeholder="Добавьте комментарий..."
              variant="standard"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                pr: 2,
                "& .MuiInput-underline:before": { borderBottom: "none" },
                "& .MuiInput-underline:after": { borderBottom: "none" },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                },
              }}
            />
            <IconButton
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              color="primary"
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
