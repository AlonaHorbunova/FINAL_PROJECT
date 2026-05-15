// 1. Сначала опишем пользователя
export interface IUser {
  _id: string;
  username: string;
  avatar?: string; // аватарка может быть, а может и нет
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
  image: string;
  description: string;
  author: IUser; // автор поста
  likes: string[]; // массив ID тех, кто лайкнул
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
