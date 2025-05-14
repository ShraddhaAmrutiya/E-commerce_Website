"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.Role)) {
            return res.status(403).json({ message: req.t("auth.PermissionDenide") });
        }
        next();
    };
};
exports.default = checkRole;
