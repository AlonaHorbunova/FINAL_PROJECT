import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  TextareaAutosize,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAppDispatch } from "../../redux/hooks";
import { addPost } from "../../redux/posts/postsSlice";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
  outline: "none",
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const [caption, setCaption] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Обработка выбора картинки (строгая типизация события)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile: File = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Отправка формы (строгая типизация события формы)
  const handleSubmit = async (e: React.SyntheticEvent): Promise<void> => {
    e.preventDefault(); // Теперь это сработает железно без зачеркиваний
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      setLoading(true);
      await dispatch(addPost(formData)).unwrap();

      // Очищаем форму при успешном создании
      setCaption("");
      setFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err: unknown) {
      console.error("Не удалось создать пост:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Кнопка закрытия */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.25rem",
            marginBottom: 3,
          }}
        >
          Создание публикации
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              alignItems: "center",
            }}
          >
            {/* Зона загрузки файла / Превью */}
            {!previewUrl ? (
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ width: "100%", height: 200, borderStyle: "dashed" }}
              >
                Выберите фото
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                  required
                />
              </Button>
            ) : (
              <Box sx={{ width: "100%", position: "relative" }}>
                <img
                  src={previewUrl}
                  alt="Превью"
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  sx={{ mt: 1 }}
                >
                  Удалить фото
                </Button>
              </Box>
            )}

  
            <TextareaAutosize
              minRows={3}
              maxRows={6}
              placeholder="Добавьте подпись..."
              value={caption}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCaption(e.target.value)
              }
              maxLength={2200}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                borderColor: "#ccc",
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                fontSize: "1rem",
                boxSizing: "border-box",
                resize: "none",
                outline: "none",
              }}
            />

            {/* Кнопка отправки */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!file || loading}
              sx={{ bgcolor: "#0095f6", "&:hover": { bgcolor: "#1877f2" } }}
            >
              {loading ? "Публикация..." : "Поделиться"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CreatePostModal;
