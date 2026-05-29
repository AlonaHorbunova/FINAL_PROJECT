import { Notification } from "../db/models/Notification.js";
import { io } from "../socket/socket.service.js";
import { Types } from "mongoose";

interface INotificationData {
  receiver: string;
  issuer: string;
  type: "like" | "comment" | "follow";
  post?: string;
}

export const sendNotification = async (data: INotificationData) => {
  try {
    const newNotification = await Notification.create({
      receiver: new Types.ObjectId(data.receiver),
      issuer: new Types.ObjectId(data.issuer),
      type: data.type,
      post: data.post ? new Types.ObjectId(data.post) : undefined,
    });

    // Подгружаем инфо об авторе действия
    const populated = await newNotification.populate(
      "issuer",
      "username avatar",
    );

    if (io) {
      io.to(data.receiver).emit("new_notification", populated);
      console.log(
        `📡 Сокет-уведомление [${data.type}] отправлено юзеру ${data.receiver}`,
      );
    }

    return populated;
  } catch (error) {
    console.error("❌ Ошибка при создании/отправке уведомления:", error);
  }
};
