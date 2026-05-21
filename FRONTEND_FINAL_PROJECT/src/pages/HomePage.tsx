import React, { useEffect, useState } from "react";
import { Typography, CircularProgress, Box, Link } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPosts } from "../redux/posts/postsSlice";
import { IPost } from "../types";
import PostCard from "../components/Posts/PostCard";
import PostDetailModal from "../components/Posts/PostDetailModal";

type SafePost = IPost & {
  id?: string | number;
  _id?: string | number;
};

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.posts);
  const posts = items as SafePost[];

  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (post: IPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: "1196px",
          mx: "auto",
          pt: "58px",
          px: { xs: "20px", md: "78px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress sx={{ color: "black" }} />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {!loading && !error && posts.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ mt: 8, textAlign: "center" }}
          >
            Лента пуста. Будь первым, кто выложит post!
          </Typography>
        )}

        {!loading && !error && posts.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 404px)",
              columnGap: "39px",
              rowGap: "23.38px",
              justifyContent: "center",
              mb: "60px",
            }}
          >
            {posts.map((post: SafePost, index: number) => {
              const postKey =
                post.id?.toString() ||
                post._id?.toString() ||
                `post-idx-${index}`;
              return (
                <Box key={postKey} sx={{ width: "404px" }}>
                  <PostCard
                    post={post as IPost}
                    onOpenModal={handleOpenModal}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box
        component="footer"
        sx={{
          width: "100%",
          height: "158px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          borderTop: "1px solid #dbdbdb",
          bgcolor: "#ffffff",
          px: 4,
          boxSizing: "border-box",
          mt: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            "Home",
            "Search",
            "Explore",
            "Messages",
            "Notifications",
            "Create",
            "Profile",
          ].map((item) => (
            <Link
              key={item}
              href="#"
              sx={{
                fontSize: "12px",
                color: "#737373",
                textDecoration: "none",
                fontWeight: "500",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {item}
            </Link>
          ))}
        </Box>

        <Typography variant="body2" sx={{ fontSize: "12px", color: "#737373" }}>
          © {new Date().getFullYear()} ICHGRAM FROM ICH PRO
        </Typography>
      </Box>

      {/* ИСПРАВЛЕНО: Свойство называется open */}
      <PostDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
      />
    </Box>
  );
};

export default HomePage;
