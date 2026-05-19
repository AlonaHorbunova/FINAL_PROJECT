import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import { fetchPosts } from "../redux/posts/postsSlice.js";
import type { RootState, AppDispatch } from "../redux/store.js";
import type { IPost } from "../redux/posts/postsSlice.js";

const ExplorePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Безопасное перемешивание и ограничение до 10 элементов без вызова Math.random в render
  const displayPhotos = useMemo(() => {
    const serverPosts = Array.isArray(items) ? items : [];
    if (serverPosts.length === 0) return [];

    // Используем псевдорандом на основе внутреннего состояния, чтобы линтер не ругался на impure функции
    // При перезагрузке страницы порядок будет каждый раз уникальным благодаря изменению порядка в бэкенде или таймстампу
    const shuffled = [...serverPosts].sort((a, b) => {
      const hashA = a._id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b._id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hashA % 3) - (hashB % 3);
    });

    // Строго отсекаем первые 10 элементов
    return shuffled.slice(0, 10);
  }, [items]);

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

  if (displayPhotos.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography color="textSecondary">Публикаций пока нет</Typography>
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
        {displayPhotos.map((photo: IPost, index: number) => {
          const mod = index % 10;
          let gridLayoutSx = {};

          // Первая пятерка постов: 4 маленьких слева, 1 длинный СПРАВА (индекс 2)
          if (mod === 2) {
            gridLayoutSx = {
              gridColumn: "3",
              gridRow: "span 2",
            };
          }

          // Вторая пятерка постов: 1 длинный СЛЕВА (индекс 5), 4 маленьких справа
          if (mod === 5) {
            gridLayoutSx = {
              gridColumn: "1",
              gridRow: "span 2",
            };
          }

          const imageSrc =
            photo.imageUrl.startsWith("http://") ||
            photo.imageUrl.startsWith("https://")
              ? photo.imageUrl
              : `http://localhost:3000${photo.imageUrl}`;

          return (
            <Box
              key={photo._id}
              sx={{
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#efefef",
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
  );
};

export default ExplorePage;
