"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthStatus = exports.resetPasswordWithOldPassword = exports.getAllUsers = exports.getUser = exports.logoutUser = exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = require("../Models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const registerUser = async (req, res) => {
    const { userName, password, email, Role, firstName, lastName, phone, age, gender, } = req.body;
    if (!userName || !password || !email) {
        return res.status(400).json({ message: "Fill the required fields." });
    }
    try {
        const existingUser = await userModel_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists , please use another email" });
        }
        const newUser = new userModel_1.User({
            userName,
            email,
            password,
            Role,
            firstName,
            lastName,
            phone,
            age,
            gender,
        });
        await newUser.save();
        await new cartModel_1.default({ userId: newUser._id, products: [] }).save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, tokenVersion: newUser.tokenVersion }, process.env.SECRET_KEY, { expiresIn: '1d' });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            userId: newUser._id,
            userName: newUser.userName,
            Role: newUser.Role,
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};
exports.registerUser = registerUser;
exports.default = registerUser;
const loginUser = async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({ message: "Please fill in both username and password." });
    }
    try {
        const user = await userModel_1.User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: "User Not found" });
        }
        // Compare the password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch || !user) {
            return res.status(401).json({ message: "Please enter valid credentials." });
        }
        // Check if JWT secret is defined
        if (!SECRET_KEY) {
            return res.status(500).json({
                message: "JWT secrets are not defined in the environment variables.",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.SECRET_KEY, { expiresIn: '1d' });
        return res.status(200).json({
            message: "User logged in successfully.",
            accessToken,
            userId: user._id,
            userName: user.userName,
            Role: user.Role,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.loginUser = loginUser;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    // Ensure email is provided
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    try {
        const user = await userModel_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Please enter a registered email ID." });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.SECRET_KEY, { expiresIn: '1d' });
        user.resetToken = resetToken;
        await user.save({ validateModifiedOnly: true });
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        const mailOptions = {
            from: '"Support Team" <process.env.EMAIL_USER>',
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Use the following token to reset your password: ${resetToken}`,
            html: `<p>You requested a password reset.</p><p>Use the following token to reset your password:</p><p>${resetLink}">Reset your password</a></p></p>`,
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Reset token sent to email." });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const userId = decoded.id;
        const user = await userModel_1.User.findById(userId);
        if (!user || user.resetToken !== token) {
            return res.status(401).json({ message: "Invalid or expired reset token." });
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.tokenVersion += 1;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully. Please log in again." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.resetPassword = resetPassword;
const resetPasswordWithOldPassword = async (req, res) => {
    const { userName, oldPassword, newPassword } = req.body;
    if (!userName || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.-=+<>?&*()]).{8,15}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            message: "Password must be 8-15 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        });
    }
    try {
        const user = await userModel_1.User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect old password." });
        }
        user.password = newPassword;
        user.tokenVersion += 1;
        await user.save();
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion, }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ message: "Password updated successfully.",
            token: newAccessToken,
        });
    }
    catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.resetPasswordWithOldPassword = resetPasswordWithOldPassword;
const logoutUser = (req, res) => {
    return res.status(200).json({ message: "User logged out successfully." });
};
exports.logoutUser = logoutUser;
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel_1.User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getUser = getUser;
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_1.User.find().select("-password");
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
const checkAuthStatus = async (req, res) => {
    try {
        const user = await userModel_1.User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({
            userName: user.userName,
            userId: user._id,
            isLoggedIn: true,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.checkAuthStatus = checkAuthStatus;
