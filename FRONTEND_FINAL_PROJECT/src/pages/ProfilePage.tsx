import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Button,
  Link,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchCurrentUser,
  fetchUserById,
  clearProfile,
  updateUserProfile,
} from "../redux/user/userSlice";
import { fetchPosts } from "../redux/posts/postsSlice";
import EditProfileModal from "../components/Profile/EditProfileModal";
import PostDetailModal from "../components/Posts/PostDetailModal";
import { IUser, IPost } from "../types";

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    profileUser,
    loading: userLoading,
    error: userError,
  } = useAppSelector(
    (state: {
      user: {
        profileUser: IUser | null;
        loading: boolean;
        error: string | null;
      };
    }) => state.user,
  );

  const { user: myProfile } = useAppSelector(
    (state: { auth: { user: IUser | null } }) => state.auth,
  );

  const { items: allPosts, loading: postsLoading } = useAppSelector(
    (state: { posts: { items: IPost[]; loading: boolean } }) => state.posts,
  );

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleOpenPostModal = (post: IPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const isFollowing = profileUser?.followers?.includes(myProfile?._id || "");

  useEffect(() => {
    dispatch(clearProfile());
    dispatch(fetchPosts());

    if (id) {
      dispatch(fetchUserById(id));
    } else {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, id]);

  const handleFollow = async () => {
    if (!id) return;
    console.log(isFollowing ? "Отписаться от" : "Подписаться на", id);
  };

  const handleSaveProfile = async (formData: FormData) => {
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setIsEditOpen(false);
    } catch (err) {
      console.error("Ошибка при сохранении профиля:", err);
    }
  };

  const userPosts = allPosts.filter((post: IPost) => {
    if (!post.author) return false;
    const postAuthorId =
      typeof post.author === "object" ? post.author._id : post.author;
    return postAuthorId === profileUser?._id;
  });

  if (userLoading || postsLoading) {
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
        }}
      >
        {profileUser && (
          <>
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
                        : `http://localhost:3000/${profileUser.avatar.replace(/^\//, "")}`
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
                  <Button
                    variant={
                      id ? (isFollowing ? "outlined" : "contained") : "outlined"
                    }
                    onClick={id ? handleFollow : () => setIsEditOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "600",
                      fontSize: "14px",
                      px: "16px",
                      py: "4px",
                      borderRadius: "4px",
                      borderColor: id
                        ? isFollowing
                          ? "#dbdbdb"
                          : "transparent"
                        : "#dbdbdb",
                      color: id
                        ? isFollowing
                          ? "#262626"
                          : "white"
                        : "#262626",
                      bgcolor: id
                        ? isFollowing
                          ? "#fafafa"
                          : "#0095f6"
                        : "#fafafa",
                      "&:hover": {
                        bgcolor: id
                          ? isFollowing
                            ? "#f2f2f2"
                            : "#1877f2"
                          : "#f2f2f2",
                      },
                    }}
                  >
                    {id
                      ? isFollowing
                        ? "Unfollow"
                        : "Follow"
                      : "Edit profile"}
                  </Button>
                  {id && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/messages?targetId=${id}`)}
                      sx={{
                        textTransform: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        px: "16px",
                        py: "4px",
                        borderRadius: "4px",
                        borderColor: "#dbdbdb",
                        color: "#262626",
                        bgcolor: "#fafafa",
                        "&:hover": { bgcolor: "#f2f2f2" },
                      }}
                    >
                      Message
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
                      {profileUser.followersCount || 0}
                    </Box>{" "}
                    followers
                  </Typography>
                  <Typography sx={{ fontSize: "16px", color: "#262626" }}>
                    <Box component="span" sx={{ fontWeight: "600" }}>
                      {profileUser.followingCount || 0}
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
                    {profileUser.username}
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

            <Box
              sx={{
                borderTop: "1px solid #dbdbdb",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#262626",
                  py: "16px",
                }}
              >
                Posts
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "28px",
                mb: "60px",
              }}
            >
              {userPosts.map((post) => (
                <Box
                  key={post._id}
                  onClick={() => handleOpenPostModal(post)}
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
                    src={
                      post.imageUrl?.startsWith("http")
                        ? post.imageUrl
                        : `http://localhost:3000/${post.imageUrl?.replace(/^\//, "")}`
                    }
                    alt="Post"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>

      {profileUser && (
        <EditProfileModal
          key={profileUser.username}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          currentUser={profileUser}
          onSave={handleSaveProfile}
        />
      )}

      <PostDetailModal
        open={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        post={selectedPost}
      />
    </Box>
  );
};

export default ProfilePage;
