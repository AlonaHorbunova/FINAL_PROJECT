export interface IUser {
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  followers?: string[];
  following?: string[];
  followersCount?: number;
  followingCount?: number;
}

export interface IComment {
  _id: string;
  user: IUser;
  text: string;
  createdAt: string;
}

// 3. Обновим пост
export interface IPost {
  _id: string;
  imageUrl: string;
  caption: string;
  author: IUser;
  likes: string[];
  comments: IComment[];
  createdAt: string;
}

// 4. Добавим тип для сообщения в чате (у тебя уже есть папка Chat)
export interface IMessage {
  _id: string;
  chatId: string;
  sender: IUser;
  text: string;
  createdAt: string;
}
