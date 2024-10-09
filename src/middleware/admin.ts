import { Request, Response, NextFunction } from 'express';

interface User {
  _id: string; 
  Role: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user || user.Role !== "admin") {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }

  next();
};

export default isAdmin;
