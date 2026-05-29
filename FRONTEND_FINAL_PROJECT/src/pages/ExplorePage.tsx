import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";
import { IPost } from "../types/index";
import PostDetailModal from "../components/Posts/PostDetailModal";
import Footer from "../components/Footer";

const ExplorePage: React.FC = () => {
  const [shuffledPosts, setShuffledPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    const fetchRandomPosts = async () => {
      try {
        setLoading(true);
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
  }, []);

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
    // 2. Обертка для прижимания футера к низу
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          maxWidth: "975px",
          margin: "0 auto",
          padding: "20px 0",
          flexGrow: 1,
        }}
      >
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

            if (mod === 2)
              gridLayoutSx = { gridColumn: "3", gridRow: "span 2" };
            if (mod === 5)
              gridLayoutSx = { gridColumn: "1", gridRow: "span 2" };

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
      </Box>
      <Footer /> {/* 3. Сам футер */}
      <PostDetailModal
        open={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        post={selectedPost}
      />
    </Box>
  );
};

export default ExplorePage;
