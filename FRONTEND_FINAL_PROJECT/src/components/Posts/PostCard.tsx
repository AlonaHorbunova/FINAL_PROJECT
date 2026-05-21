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
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutlined as ChatBubbleOutlineIcon,
  Send as PaperPlaneIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import { Box } from "@mui/system";
import { IPost } from "../../types/index";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleLikePost } from "../../redux/posts/postsSlice";

interface PostCardProps {
  post: IPost;
  onOpenModal: (post: IPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onOpenModal }) => {
  const dispatch = useAppDispatch();
  const BACKEND_URL = "http://localhost:3000";

  const currentUser = useAppSelector((state) => state.auth.user);

  const isLiked = currentUser
    ? (post.likes || []).includes(currentUser._id)
    : false;

  const handleLike = () => {
    if (!currentUser?._id) {
      console.error("Лайк невозможен: пользователь не авторизован");
      return;
    }
    dispatch(toggleLikePost({ postId: post._id, userId: currentUser._id }));
  };

  const getFullUrl = (urlPath: string | undefined) => {
    if (!urlPath) return "";
    if (urlPath.startsWith("http")) return urlPath;
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
      <CardHeader
        avatar={
          <Avatar
            src={authorAvatar}
            alt={authorName}
            sx={{ width: 32, height: 32, bgcolor: "#efefef" }}
          >
            {authorName[0]?.toUpperCase()}
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

      {postImageUrl && (
        <CardMedia
          component="img"
          image={postImageUrl}
          alt="Публикация"
          onClick={() => onOpenModal(post)}
          sx={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            bgcolor: "#fafafa",
            cursor: "pointer",
          }}
        />
      )}

      <Box
        sx={{ display: "flex", justifyContent: "space-between", px: 1, pt: 1 }}
      >
        <Box>
          <IconButton onClick={handleLike}>
            {isLiked ? (
              <FavoriteIcon sx={{ color: "#ed4956" }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: "#262626" }} />
            )}
          </IconButton>
          <IconButton onClick={() => onOpenModal(post)}>
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

      <CardContent sx={{ px: 2, py: 0.5, "&:last-child": { pb: 2 } }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
          {post.likes?.length || 0} отметок "Нравится"
        </Typography>

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
