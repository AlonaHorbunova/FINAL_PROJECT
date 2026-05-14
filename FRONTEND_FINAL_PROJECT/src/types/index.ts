export interface IComment {
  _id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  image: string;
  description: string;
  author: string;
  likes: string[];
  comments: IComment[];
}
