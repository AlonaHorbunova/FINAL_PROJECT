// 1. Сначала опишем пользователя
export interface IUser {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  website?: string;
  followers?: string[]; // массив ID подписчиков
  following?: string[]; // массив ID тех, на кого подписан
  followersCount?: number;
  followingCount?: number;
}

// 2. Обновим комментарий (теперь мы знаем, кто его написал)
export interface IComment {
  _id: string;
  user: IUser; // здесь будет объект с именем и фото
  text: string;
  createdAt: string;
}

// 3. Обновим пост
export interface IPost {
  _id: string;
  imageUrl: string; // Изменили с image на imageUrl под бэкенд
  caption: string; // Изменили с description на caption под бэкенд
  author: IUser; // Автор поста (его мы популейтим)
  likes: string[]; // Массив ID тех, кто лайкнул
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
