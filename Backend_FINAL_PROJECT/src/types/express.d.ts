import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // Здесь мы описываем, что именно будет лежать в req.user после авторизации
      user?: {
        id: string;
        username?: string;
        email?: string;
      };
    }
  }
}
