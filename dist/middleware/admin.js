"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.Role !== "admin") {
        return res.status(403).json({ message: "You do not have permission to perform this action." });
    }
    next();
};
exports.default = isAdmin;
