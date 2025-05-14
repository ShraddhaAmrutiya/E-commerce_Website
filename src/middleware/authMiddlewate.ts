
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../Models/userModel'; 

interface AuthenticatedRequest extends Request {
    user?: {
      id: string;
      Role: string;
    };
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // const token = req.headers.authorization?.split(" ")[1];
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: req.t("auth.Notoken") });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string; tokenVersion?: number };
        const user = await User.findById(decoded.id).select('-password');  
        
        if (!user) {
            return res.status(404).json({ message: req.t("auth.NoUser") });
        }
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ message: req.t("auth.tokenVersion") });
        }

        req.user = { id: user._id.toString(), Role: user.Role }; 
        next();
    } catch (error) {
        res.status(403).json({ message: req.t("auth.tokenverificationerr") , error });
    }
};

export default authMiddleware;
