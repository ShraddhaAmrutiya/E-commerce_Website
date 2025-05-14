

import { Request, Response, NextFunction } from 'express';

interface User {
  _id: string;
  Role: 'admin' | 'seller' | 'customer'; 
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

const checkRole = (allowedRoles: Array<'admin' | 'seller' | 'customer'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.Role)) {
      return res.status(403).json({ message: req.t("auth.PermissionDenide")});
    }

    next();
  };
};

export default checkRole;
