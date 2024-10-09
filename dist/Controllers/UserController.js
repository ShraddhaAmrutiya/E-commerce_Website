"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = require("../Models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const registerUser = async (req, res) => {
    const { userName, password, email, Role } = req.body;
    if (!userName || !password || !email) {
        return res.status(400).send({ message: "Fill the required fields." });
    }
    try {
        let user = await userModel_1.User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists" });
        const newUser = new userModel_1.User({
            userName,
            email,
            password,
            Role: Role,
        });
        await newUser.save();
        res.status(201).json({
            message: "User registered successfully",
            _id: newUser._id,
            userName: newUser.userName,
        });
    }
    catch (error) {
        res
            .status(500)
            .send({ error: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({ message: "Fill the required fields." });
    }
    try {
        const user = await userModel_1.User.findOne({ userName });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        if (!SECRET_KEY) {
            return res.status(500).json({
                message: "JWT secrets are not defined in the environment variables.",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, SECRET_KEY, {
            expiresIn: "1h",
        });
        return res.status(200).json({
            message: "User logged in successfully.",
            accessToken,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.loginUser = loginUser;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    try {
        const user = await userModel_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, SECRET_KEY, { expiresIn: "15m" });
        user.resetToken = resetToken;
        await user.save();
        const mailOptions = {
            from: '"Support Team" <process.env.EMAIL_USER>',
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Use the following token to reset your password: ${resetToken}`,
            html: `<p>You requested a password reset.</p>
               <p>Use the following token to reset your password:</p>
               <p><strong>${resetToken}</strong></p>`,
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Reset token sent to email." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(resetToken, process.env.SECRET_KEY);
        const userId = decoded.id;
        const user = await userModel_1.User.findById(userId);
        if (!user || user.resetToken !== resetToken) {
            return res.status(401).json({ message: "Invalid or expired reset token." });
        }
        user.password = newPassword;
        user.resetToken = undefined;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.resetPassword = resetPassword;
const logoutUser = (req, res) => {
    return res.status(200).json({ message: "User logged out successfully." });
};
exports.logoutUser = logoutUser;
