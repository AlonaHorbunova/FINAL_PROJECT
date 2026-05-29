import React, { useState, useEffect } from "react"; // Убрали useMemo
import axios from "axios"; // Добавили axios
import { Box, CircularProgress } from "@mui/material";
import { IPost } from "../types/index";
import PostDetailModal from "../components/Posts/PostDetailModal";

const ExplorePage: React.FC = () => {
  // 1. Используем локальное состояние для случайных постов
  const [shuffledPosts, setShuffledPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // 2. Запрашиваем данные с нового URL
  useEffect(() => {
    const fetchRandomPosts = async () => {
      try {
        setLoading(true);
        // Запрос к вашему новому эндпоинту
        const { data } = await axios.get(
          "http://localhost:3000/api/posts/random",
        );
        setShuffledPosts(data);
      } catch (error) {
        console.error("Ошибка при загрузке случайных постов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomPosts();
  }, []); // Запускаем только при монтировании

  const handleOpenModal = (post: IPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "975px", margin: "0 auto", padding: "20px 0" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gridAutoRows: "317px",
          gap: "4px",
        }}
      >
        {shuffledPosts.map((photo: IPost, index: number) => {
          const mod = index % 10;
          let gridLayoutSx = {};

          if (mod === 2) gridLayoutSx = { gridColumn: "3", gridRow: "span 2" };
          if (mod === 5) gridLayoutSx = { gridColumn: "1", gridRow: "span 2" };

          const imageSrc = photo.imageUrl.startsWith("http")
            ? photo.imageUrl
            : `http://localhost:3000${photo.imageUrl}`;

          return (
            <Box
              key={photo._id || index}
              onClick={() => handleOpenModal(photo)}
              sx={{
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#efefef",
                cursor: "pointer",
                ...gridLayoutSx,
              }}
            >
              <Box
                component="img"
                src={imageSrc}
                alt={photo.caption || "Explore piece"}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          );
        })}
      </Box>

      <PostDetailModal
        open={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        post={selectedPost}
      />
    </Box>
  );
};

export default ExplorePage;
