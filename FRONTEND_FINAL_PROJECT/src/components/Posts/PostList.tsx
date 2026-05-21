import React from "react";
import { Box } from "@mui/material";
import PostCard from "./PostCard";
import { IPost } from "../../types/index";

interface PostListProps {
  posts: IPost[];
  onOpenModal: (post: IPost) => void; // ИСПРАВЛЕНО: убрали '?', теперь проп обязательный
}

const PostList: React.FC<PostListProps> = ({ posts, onOpenModal }) => {
  if (!posts || posts.length === 0) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", mt: 4, color: "gray" }}
      >
        Нет доступных публикаций
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        pt: 4,
      }}
    >
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onOpenModal={onOpenModal} />
      ))}
    </Box>
  );
};

export default PostList;
