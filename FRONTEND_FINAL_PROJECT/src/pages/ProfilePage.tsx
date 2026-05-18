import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Button,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCurrentUser,
  fetchUserById,
  clearProfile,
  updateUserProfile,
} from "../redux/user/userSlice";
import { fetchPosts } from "../redux/posts/postsSlice";

interface PostAuthor {
  _id?: string;
  id?: string;
}

interface SafePost {
  _id?: string | number;
  id?: string | number;
  imageUrl?: string;
  caption?: string;
  author?: PostAuthor | string;
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const {
    profileUser,
    loading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user);
  const { items: allPosts, loading: postsLoading } = useAppSelector(
    (state) => state.posts,
  );

  // Стейты для управления модалкой и её полями
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    dispatch(clearProfile());
    dispatch(fetchPosts());

    if (id) {
      dispatch(fetchUserById(id));
    } else {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, id]);

  // Заполняем поля формы текущими данными пользователя при открытии модалки
  const handleOpenEdit = () => {
    if (profileUser) {
      setUsername(profileUser.username || "");
      setFullName(profileUser.fullName || "");
      setBio(profileUser.bio || "");
      setWebsite(profileUser.website || "");
      setAvatarFile(null);
      setAvatarPreview("");
      setIsEditOpen(true);
    }
  };

  // Обработчик выбора файла аватарки
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Делаем временную ссылку для предпросмотра
    }
  };

  const handleSaveProfile = async () => {
    // Если данных пользователя почему-то нет в стейте, прерываем выполнение
    if (!profileUser) return;

    const formData = new FormData();
    let hasChanges = false;

    // 1. Проверяем username: отправляем, только если он изменился и не пустой
    if (username.trim() !== "" && username !== profileUser.username) {
      formData.append("username", username.trim());
      hasChanges = true;
    }

    // 2. Проверяем fullName: отправляем, только если изменилось
    if (fullName.trim() !== (profileUser.fullName || "")) {
      formData.append("fullName", fullName.trim());
      hasChanges = true;
    }

    // 3. Проверяем bio: отправляем, если изменилось (можно отправить пустую строку, чтобы стереть)
    if (bio.trim() !== (profileUser.bio || "")) {
      formData.append("bio", bio.trim());
      hasChanges = true;
    }

    // 4. Проверяем website: отправляем, если изменился
    if (website.trim() !== (profileUser.website || "")) {
      formData.append("website", website.trim());
      hasChanges = true;
    }

    // 5. Проверяем, прикрепил ли пользователь новый файл аватарки
    if (avatarFile) {
      formData.append("avatar", avatarFile);
      hasChanges = true;
    }

    // Если вообще ничего не изменилось, просто закрываем модалку и не дёргаем сервер
    if (!hasChanges) {
      setIsEditOpen(false);
      return;
    }

    // Отправляем только то, что реально поменялось
    await dispatch(updateUserProfile(formData));
    setIsEditOpen(false);
  };

  const userPosts = (allPosts as SafePost[]).filter((post: SafePost) => {
    if (!post.author) return false;

    const postAuthorId =
      typeof post.author === "object"
        ? post.author._id || post.author.id
        : post.author;

    return (
      postAuthorId === profileUser?._id || postAuthorId === profileUser?.id
    );
  });

  const isLoading = userLoading || postsLoading;

  if (isLoading && !profileUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          width: "100%",
        }}
      >
        <CircularProgress sx={{ color: "black" }} />
      </Box>
    );
  }

  if (userError) {
    return (
      <Box sx={{ p: 4, textAlign: "center", width: "100%" }}>
        <Typography color="error" variant="h6">
          {userError}
        </Typography>
      </Box>
    );
  }

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
          maxWidth: "935px",
          mx: "auto",
          pt: "40px",
          px: "20px",
          boxSizing: "border-box",
        }}
      >
        {profileUser && (
          <>
            {/* ШАПКА ПРОФИЛЯ */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: "30px", md: "80px" },
                alignItems: "flex-start",
                mb: "44px",
                pl: { xs: 0, md: "40px" },
              }}
            >
              <Box
                sx={{
                  p: "3px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              >
                <Avatar
                  src={
                    profileUser.avatar
                      ? profileUser.avatar.startsWith("http")
                        ? profileUser.avatar
                        : `http://localhost:3000${profileUser.avatar.startsWith("/") ? "" : "/"}${profileUser.avatar}`
                      : ""
                  }
                  alt={profileUser.username}
                  sx={{
                    width: { xs: "80px", md: "150px" },
                    height: { xs: "80px", md: "150px" },
                    border: "4px solid #ffffff",
                    bgcolor: "#fafafa",
                  }}
                />
              </Box>

              <Box sx={{ flexGrow: 1, pt: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    mb: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "20px",
                      fontWeight: "300",
                      color: "#262626",
                    }}
                  >
                    {profileUser.username}
                  </Typography>

                  {id ? (
                    <Button
                      variant="contained"
                      disableElevation
                      sx={{
                        bgcolor: "#0095f6",
                        color: "white",
                        textTransform: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        px: 3,
                        py: "4px",
                        borderRadius: "4px",
                        "&:hover": { bgcolor: "#1877f2" },
                      }}
                    >
                      Follow
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={handleOpenEdit} // Открываем нашу форму при клике
                      sx={{
                        color: "#262626",
                        borderColor: "#dbdbdb",
                        textTransform: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        px: "16px",
                        py: "4px",
                        borderRadius: "4px",
                        bgcolor: "#fafafa",
                        "&:hover": {
                          bgcolor: "#f2f2f2",
                          borderColor: "#dbdbdb",
                        },
                      }}
                    >
                      Edit profile
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: "40px", mb: "20px" }}>
                  <Typography sx={{ fontSize: "16px", color: "#262626" }}>
                    <Box component="span" sx={{ fontWeight: "600" }}>
                      {userPosts.length}
                    </Box>{" "}
                    posts
                  </Typography>
                  <Typography sx={{ fontSize: "16px", color: "#262626" }}>
                    <Box component="span" sx={{ fontWeight: "600" }}>
                      {profileUser.followersCount || "0"}
                    </Box>{" "}
                    followers
                  </Typography>
                  <Typography sx={{ fontSize: "16px", color: "#262626" }}>
                    <Box component="span" sx={{ fontWeight: "600" }}>
                      {profileUser.followingCount || "0"}
                    </Box>{" "}
                    following
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#262626",
                    }}
                  >
                    {profileUser.fullName || "Имя не указано"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#262626",
                      whiteSpace: "pre-line",
                      mt: "4px",
                      lineHeight: "1.4",
                    }}
                  >
                    {profileUser.bio || "Описание профиля отсутствует"}
                  </Typography>
                  {profileUser.website && (
                    <Link
                      href={
                        profileUser.website.startsWith("http")
                          ? profileUser.website
                          : `https://${profileUser.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "inline-block",
                        mt: "4px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#00376b",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {profileUser.website.replace(/(^\w+:|^)\/\//, "")}
                    </Link>
                  )}
                </Box>
              </Box>
            </Box>

            {/* ВКЛАДКА "POSTS" */}
            <Box
              sx={{
                borderTop: "1px solid #dbdbdb",
                display: "flex",
                justifyContent: "center",
                mb: "4px",
              }}
            >
              <Box
                sx={{
                  borderTop: "1px solid #000000",
                  mt: "-1px",
                  py: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#262626",
                  }}
                >
                  Posts
                </Typography>
              </Box>
            </Box>

            {/* СЕТКА ПУБЛИКАЦИЙ */}
            {userPosts.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography color="text.secondary" sx={{ fontSize: "14px" }}>
                  Публикаций пока нет
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "28px",
                  mb: "60px",
                }}
              >
                {userPosts.map((post: SafePost, index: number) => {
                  const postKey =
                    post.id?.toString() ||
                    post._id?.toString() ||
                    `profile-post-${index}`;

                  let cleanSrc = "https://via.placeholder.com/300";
                  if (post.imageUrl) {
                    if (post.imageUrl.startsWith("http")) {
                      cleanSrc = post.imageUrl;
                    } else {
                      const formattedPath = post.imageUrl.startsWith("/")
                        ? post.imageUrl.slice(1)
                        : post.imageUrl;
                      cleanSrc = `http://localhost:3000/${formattedPath}`;
                    }
                  }

                  return (
                    <Box
                      key={postKey}
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1/1",
                        bgcolor: "#efefef",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        component="img"
                        src={cleanSrc}
                        alt={post.caption || "User post"}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "filter 0.2s ease-in-out",
                          "&:hover": { filter: "brightness(0.85)" },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ВСПЛЫВАЮЩАЯ МОДАЛКА РЕДАКТИРОВАНИЯ ПРОФИЛЯ */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "600" }}>
          Edit Profile
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          {/* Инпут выбора аватара в виде круглой превьюшки */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              my: 1,
            }}
          >
            <Avatar
              src={
                avatarPreview ||
                (profileUser?.avatar
                  ? profileUser.avatar.startsWith("http")
                    ? profileUser.avatar
                    : `http://localhost:3000${profileUser.avatar.startsWith("/") ? "" : "/"}${profileUser.avatar}`
                  : "")
              }
              sx={{ width: 80, height: 80 }}
            />
            <Button
              component="label"
              variant="text"
              sx={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Change profile photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          <TextField
            label="Username"
            variant="outlined"
            size="small"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Name"
            variant="outlined"
            size="small"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            label="Bio"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <TextField
            label="Website"
            variant="outlined"
            size="small"
            fullWidth
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setIsEditOpen(false)}
            sx={{ color: "black", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#0095f6",
              textTransform: "none",
              "&:hover": { bgcolor: "#1877f2" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ФУТЕР */}
      <Box
        component="footer"
        sx={{
          width: "100%",
          py: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          bgcolor: "#ffffff",
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
          ].map((item) => (
            <Link
              key={item}
              href="#"
              sx={{
                fontSize: "12px",
                color: "#737373",
                textDecoration: "none",
                fontWeight: "400",
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
    </Box>
  );
};

export default ProfilePage;
