import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
  Button,
  TextField,
} from "@mui/material";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username?: string;
    bio?: string;
    website?: string;
    avatar?: string;
  } | null;
  onSave: (formData: FormData) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    if (isOpen && currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
      setWebsite(currentUser.website || "");
      setAvatarFile(null);
      setAvatarPreview("");
    }
  }, [isOpen, currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async () => {
    if (!username.trim()) {
      alert("Username не может быть пустым");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("bio", bio.trim());
    formData.append("website", website.trim());

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: "center", fontWeight: "600" }}>
        Edit Profile
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
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
              (currentUser?.avatar
                ? currentUser.avatar.startsWith("http")
                  ? currentUser.avatar
                  : `http://localhost:3000${currentUser.avatar.startsWith("/") ? "" : "/"}${currentUser.avatar}`
                : "")
            }
            sx={{ width: 80, height: 80 }}
          />
          <Button
            component="label"
            variant="text"
            sx={{ textTransform: "none", fontSize: "14px", fontWeight: "600" }}
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
          onClick={onClose}
          sx={{ color: "black", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleFormSubmit}
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
  );
};

export default EditProfileModal;
