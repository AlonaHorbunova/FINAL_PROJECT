import axiosInstance from "./axiosInstance";

export const getMessagesApi = (chatId: string) =>
  axiosInstance.get(`/messages/${chatId}`);

export const sendMessageApi = (data: {
  chatId: string;
  receiver: string;
  text: string;
}) => axiosInstance.post("/messages", data);
