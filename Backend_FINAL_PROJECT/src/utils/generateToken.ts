import jwt from "jsonwebtoken";
import { type IUser } from "../db/models/User.js"; 

const generateToken = (user: IUser): string => {
 
  const payload = {
    id: user._id, 
    username: user.username,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET не определен в переменных окружения!");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "30d", 
  });
};

export default generateToken;
