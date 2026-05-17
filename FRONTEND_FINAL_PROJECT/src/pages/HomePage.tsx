import { useEffect } from "react";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPosts } from "../redux/posts/postsSlice";

const HomePage = () => {
  const dispatch = useAppDispatch();

  // Достаем данные постов из Redux-стора
  const {
    items: posts,
    loading,
    error,
  } = useAppSelector((state) => state.posts);

  // Вызываем загрузку постов при монтировании компонента
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4, pb: 4 }}>
      {/* Если идет загрузка — показываем крутилку */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Если произошла ошибка — выводим сообщение */}
      {error && (
        <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      {/* Если загрузка завершена, ошибок нет, но и постов в базе 0 */}
      {!loading && !error && posts.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 8, textAlign: "center" }}>
          Лента пуста. Будь первым, кто выложит пост!
        </Typography>
      )}

      {/* Лента постов */}
      {!loading && !error && posts.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {posts.map((post) => (
            <Box
              key={post._id}
              sx={{ p: 2, border: "1px solid #dbdbdb", borderRadius: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                @{post.author?.username || "unknown"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                Поле картинки: {post.imageUrl}
              </Typography>
              <Typography variant="body1">{post.caption}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
