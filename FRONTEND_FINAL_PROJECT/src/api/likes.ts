import axiosInstance from "./axiosInstance";

export const likePostApi = async (postId: string) => {
  const { data } = await axiosInstance.post(`/likes/${postId}`);
  return data; // Возвращает { message: "...", liked: boolean }
};
