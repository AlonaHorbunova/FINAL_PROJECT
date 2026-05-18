import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { fetchPosts } from "../redux/posts/postsSlice.js";
import type { RootState, AppDispatch } from "../redux/store.js";

// Интерфейс для одного поста
interface Post {
  _id: string;
  imageUrl: string;
  caption?: string;
}

// Временный массив картинок-заглушек ИСКЛЮЧИТЕЛЬНО для теста сетки,
// пока на бэкенде отдается ошибка 500 Internal Server Error
const mockPhotos: Post[] = [
  {
    _id: "1",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
  },
  {
    _id: "2",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
  {
    _id: "3",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  }, // Будет вытянутым справа
  {
    _id: "4",
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
  },
  {
    _id: "5",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  },
  {
    _id: "6",
    imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d",
  },
  {
    _id: "7",
    imageUrl: "https://images.unsplash.com/photo-1472214222541-d510753a4707",
  }, // Будет вытянутым слева
  {
    _id: "8",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  },
  {
    _id: "9",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },
  {
    _id: "10",
    imageUrl: "https://images.unsplash.com/photo-1433832597046-4f10e10ac764",
  },
];

const ExplorePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Забираем данные. Из-за ошибки 500 тут сейчас может быть пусто
  const { posts, loading } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

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

  // Если сервер вернул посты — берем их. Если там пусто из-за ошибки 500 — включаем mockPhotos для теста
  const serverPosts = Array.isArray(posts) ? posts : [];
  const displayPhotos = serverPosts.length > 0 ? serverPosts : mockPhotos;

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
        {displayPhotos.map((photo: Post, index: number) => {
          const mod = index % 10;
          let gridLayoutSx = {};

          // Вытянутый прямоугольник 316.99 * 635.98 справа вверху
          if (mod === 2) {
            gridLayoutSx = {
              gridColumn: 3,
              gridRow: "span 2",
            };
          }

          // Вытянутый прямоугольник 316.99 * 635.98 слева внизу
          if (mod === 6) {
            gridLayoutSx = {
              gridColumn: 1,
              gridRow: "span 2",
            };
          }

          // Определяем корректный URL: для mock-картинок оставляем как есть, для серверных добавляем домен
          const imageSrc = photo.imageUrl.startsWith("http")
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
                alt="Explore piece"
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
