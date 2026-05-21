import React from "react";
import { Modal, Box, Typography, Avatar, TextField } from "@mui/material";
import { IPost } from "../../types/index";

interface PostDetailModalProps {
  post: IPost | null;
  open: boolean;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  open,
  onClose,
}) => {
  if (!post) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          width: "80%",
          height: "80vh",
          margin: "5% auto",
          bgcolor: "white",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 2,
            bgcolor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={post.imageUrl}
            alt="post"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #efefef",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar src={post.author.avatar} />
            <b>{post.author.username}</b>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <b>{post.author.username}</b> {post.caption}
            </Typography>
            {post.comments?.map((c) => (
              <Typography key={c._id} variant="body2" sx={{ mb: 1 }}>
                <b>{c.user.username}</b> {c.text}
              </Typography>
            ))}
          </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #efefef" }}>
            <TextField
              fullWidth
              placeholder="Добавьте комментарий..."
              variant="standard"
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PostDetailModal;
