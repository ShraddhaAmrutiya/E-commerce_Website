"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../Models/userModel");
const authMiddleware = async (req, res, next) => {
    // const token = req.headers.authorization?.split(" ")[1];
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = await userModel_1.User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ message: "Invalid token. Please log in again." });
        }
        req.user = { id: user._id.toString(), Role: user.Role };
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Token verification error", error });
    }
};
exports.default = authMiddleware;
