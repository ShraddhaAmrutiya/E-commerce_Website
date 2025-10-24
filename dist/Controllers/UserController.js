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
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder("ipv4first"); // helps avoid IPv6 issues
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const registerUser = async (req, res) => {
    const { userName, password, email, Role, firstName, lastName, phone, age, gender, } = req.body;
    if (!userName || !password || !email) {
        return res.status(400).json({ message: req.t("auth.FillRequired") });
    }
    try {
        const existingUser = await userModel_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: req.t("auth.UserExists") });
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
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, tokenVersion: newUser.tokenVersion }, SECRET_KEY, { expiresIn: "1d" });
        return res.status(201).json({
            success: true,
            message: req.t("auth.Registered"),
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
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        console.log(error);
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({ message: req.t("auth.FillRequired") });
    }
    try {
        const user = await userModel_1.User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: req.t("auth.UserNotFound") });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch || !user) {
            return res.status(401).json({ message: req.t("auth.InvalidCredentials") });
        }
        if (!SECRET_KEY) {
            return res.status(500).json({ message: req.t("auth.JWTError") });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion }, SECRET_KEY, { expiresIn: "1d" });
        return res.status(200).json({
            message: req.t("auth.LoginSuccess"),
            accessToken,
            userId: user._id,
            userName: user.userName,
            Role: user.Role,
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.loginUser = loginUser;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: req.t("auth.EmailRequired") });
    }
    try {
        const user = await userModel_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: req.t("auth.UseRegisteredEmail") });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion }, SECRET_KEY, { expiresIn: "1d" });
        user.resetToken = resetToken;
        await user.save({ validateModifiedOnly: true });
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        const mailOptions = {
            from: `"Support Team" <${process.env.EMAIL_USER}>`, // ✅ interpolate properly
            to: email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Reset your password</a></p>`
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: req.t("auth.ResetEmailSent") });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: req.t("auth.MissingTokenPassword") });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = await userModel_1.User.findById(decoded.id);
        if (!user || user.resetToken !== token) {
            return res.status(401).json({ message: req.t("auth.TokenInvalid") });
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.tokenVersion += 1;
        await user.save();
        return res.status(200).json({ message: req.t("auth.ResetSuccess") });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.resetPassword = resetPassword;
const resetPasswordWithOldPassword = async (req, res) => {
    const { userName, oldPassword, newPassword } = req.body;
    if (!userName || !oldPassword || !newPassword) {
        return res.status(400).json({ message: req.t("auth.AllFieldsRequired") });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.-=+<>?&*()]).{8,15}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: req.t("auth.PasswordFormat") });
    }
    try {
        const user = await userModel_1.User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: req.t("auth.UserNotFound") });
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: req.t("auth.IncorrectOldPassword") });
        }
        user.password = newPassword;
        user.tokenVersion += 1;
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion }, SECRET_KEY, { expiresIn: "1h" });
        return res.status(200).json({ message: req.t("auth.PasswordUpdated"), token });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.resetPasswordWithOldPassword = resetPasswordWithOldPassword;
const logoutUser = (req, res) => {
    return res.status(200).json({ message: req.t("auth.LogoutSuccess") });
};
exports.logoutUser = logoutUser;
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel_1.User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: req.t("user.NotFound") });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.getUser = getUser;
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_1.User.find().select("-password");
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
const checkAuthStatus = async (req, res) => {
    try {
        const user = await userModel_1.User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: req.t("auth.UserNotFound") });
        }
        return res.status(200).json({
            userName: user.userName,
            userId: user._id,
            isLoggedIn: true,
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};
            for (let field in error.errors) {
                const rawMsg = error.errors[field].message;
                validationErrors[field] = req.t(rawMsg) || rawMsg;
            }
            return res.status(400).json({ errors: validationErrors });
        }
        return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
    }
};
exports.checkAuthStatus = checkAuthStatus;
