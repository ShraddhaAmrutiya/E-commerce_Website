import { Request, Response, NextFunction } from "express";

export const languageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const lang = req.headers["accept-language"];
  req.language = typeof lang === "string" ? lang.split(",")[0] : "en"; 
  next();
};
