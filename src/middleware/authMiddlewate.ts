
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
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string; tokenVersion: number };
        const user = await User.findById(decoded.id).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if tokenVersion in token matches the latest version in DB
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ message: "Invalid token. Please log in again." });
        }

        req.user = { id: user._id.toString(), Role: user.Role }; 
        next();
    } catch (error) {
        res.status(403).json({ message: "Token verification error", error });
    }
};

export default authMiddleware;
