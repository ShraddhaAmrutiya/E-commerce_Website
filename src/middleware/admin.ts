

import { Request, Response, NextFunction } from 'express';

// Define the shape of the user object
interface User {
  _id: string;
  Role: 'admin' | 'seller' | 'customer'; 
}

// Extend Express request to include `user`
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware to check if user has one of the allowed roles
const checkRole = (allowedRoles: Array<'admin' | 'seller' | 'customer'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.Role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }

    next();
  };
};

export default checkRole;
