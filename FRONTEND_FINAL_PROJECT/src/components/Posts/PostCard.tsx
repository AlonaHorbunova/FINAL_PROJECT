import React from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutlined as ChatBubbleOutlineIcon, // Вот здесь изменили Outline на Outlined
  Send as PaperPlaneIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import { Box } from "@mui/system";
import { IPost } from "../../types/index";

interface PostCardProps {
  post: IPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const BACKEND_URL = "http://localhost:3000";

  // УМНАЯ СБОРКА URL КАРТИНКИ ПОСТА
  const getFullUrl = (urlPath: string | undefined) => {
    if (!urlPath) return "";
    // Если бэкенд почему-то уже прислал полный URL с http, оставляем его
    if (urlPath.startsWith("http")) return urlPath;
    // Если путь начинается со слэша, а мы его добавляем — убираем дублирование
    const cleanPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  const postImageUrl = getFullUrl(post.imageUrl);
  const authorAvatar = getFullUrl(post.author?.avatar);
  const authorName = post.author?.username || "Пользователь";

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        mb: 4,
        borderRadius: 2,
        border: "1px solid #dbdbdb",
        boxShadow: "none",
      }}
    >
      {/* Шапка поста: Аватарка и Никнейм */}
      <CardHeader
        avatar={
          <Avatar
            src={authorAvatar}
            alt={authorName}
            sx={{ width: 32, height: 32, bgcolor: "#efefef" }}
          >
            {authorName[0].toUpperCase()}
          </Avatar>
        }
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
            {authorName}
          </Typography>
        }
        sx={{ p: 1.5 }}
      />

      {/* Изображение поста (Идеальный квадрат как в макете) */}
      {postImageUrl && (
        <CardMedia
          component="img"
          image={postImageUrl}
          alt="Публикация"
          sx={{
            width: "100%",
            aspectRatio: "1 / 1", // Делает картинку строго квадратной
            objectFit: "cover", // Красиво вписывает изображение
            bgcolor: "#fafafa",
          }}
        />
      )}

      {/* Блок иконок взаимодействия (Лайк, Коммент, Директ, Закладка) */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", px: 1, pt: 1 }}
      >
        <Box>
          <IconButton>
            <FavoriteBorderIcon sx={{ color: "#262626" }} />
          </IconButton>
          <IconButton>
            <ChatBubbleOutlineIcon sx={{ color: "#262626" }} />
          </IconButton>
          <IconButton>
            <PaperPlaneIcon sx={{ color: "#262626" }} />
          </IconButton>
        </Box>
        <IconButton>
          <BookmarkBorderIcon sx={{ color: "#262626" }} />
        </IconButton>
      </Box>

      {/* Количество лайков (захардкожено пока для красоты макета или берем из массива) */}
      <CardContent sx={{ px: 2, py: 0.5, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          {post.likes?.length || 0} отметок "Нравится"
        </Typography>

        {/* Текст поста: Никнейм автора + Описание */}
        <Typography
          variant="body2"
          sx={{ color: "#262626", fontSize: "0.9rem", lineHeight: "1.4" }}
        >
          <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
            {authorName}
          </Box>
          {post.caption}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PostCard;
