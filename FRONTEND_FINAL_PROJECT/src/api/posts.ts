import axiosInstance from "./axiosInstance";
import type { IPost } from "../types";
import type { AxiosResponse } from "axios";

export const getPosts = (): Promise<AxiosResponse<IPost[]>> =>
  axiosInstance.get<IPost[]>("/posts");

export const createPost = (formData: FormData): Promise<AxiosResponse<IPost>> =>
  axiosInstance.post<IPost>("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
