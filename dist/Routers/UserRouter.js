"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../Controllers/UserController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const router = express_1.default.Router();
router.post('/register', UserController_1.registerUser);
router.post('/login', UserController_1.loginUser);
router.post('/forgot-password', UserController_1.forgotPassword);
router.post('/reset-password/:token', UserController_1.resetPassword);
router.post('/reset-passwordwitholdpassword/', UserController_1.resetPasswordWithOldPassword);
router.post('/logout', UserController_1.logoutUser);
router.get("/:id", authMiddlewate_1.default, UserController_1.getUser);
router.get("/", authMiddlewate_1.default, UserController_1.getAllUsers);
exports.default = router;
