import React from "react";
import { Box } from "@mui/material";
import PostCard from "./PostCard"; // Импортируем нашу новую карточку
import { IPost } from "../../types/index";

interface PostListProps {
  posts: IPost[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
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
        // Передаем каждый пост в наш новый стилизованный компонент
        <PostCard key={post._id} post={post} />
      ))}
    </Box>
  );
};

export default PostList;
