"use strict";
// import { Request, Response, NextFunction } from 'express';
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware to check if user has one of the allowed roles
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.Role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }
        next();
    };
};
exports.default = checkRole;
