// src/api/comments.ts
import axiosInstance from "./axiosInstance";

export const addCommentApi = async (postId: string, text: string) => {
  const { data } = await axiosInstance.post(`/comments/${postId}`, { text });
  return data;
};
