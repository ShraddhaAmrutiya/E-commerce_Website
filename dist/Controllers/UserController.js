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
    const { username, password, email, Role } = req.body;
    if (!username || !password || !email) {
        return res.status(400).send({ message: "Fill the required fields." });
    }
    try {
        let user = await userModel_1.User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists" });
        const newUser = new userModel_1.User({
            username,
            email,
            password,
            Role: Role,
        });
        await newUser.save();
        await new cartModel_1.default({ userId: newUser._id, products: [] }).save();
        res.status(201).json({
            message: "User registered successfully",
            _id: newUser._id,
            username: newUser.username,
        });
    }
    catch (error) {
        res
            .status(500)
            .send({ error: error.message });
    }
};
exports.registerUser = registerUser;
// const loginUser = async (req: Request, res: Response): Promise<Response> => {
//   const { userName, password } = req.body;
// console.log("login" , req.body);
//   if (!userName || !password) { 
//     return res.status(400).json({ message: "Fill the required fields." });
//   }
//   try {
//     const user = await User.findOne({ userName });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
//     if (!SECRET_KEY) {
//       return res.status(500).json({
//         message: "JWT secrets are not defined in the environment variables.",
//       });
//     }
//     const accessToken = jwt.sign(
//       { id: user._id, tokenVersion: user.tokenVersion },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );
//     return res.status(200).json({
//       message: "User logged in successfully.",
//       accessToken,
//       userId: user._id,  // 👈 Add this line
//       userName
//     });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
const loginUser = async (req, res) => {
    const { userName, password } = req.body;
    console.log("📥 Received Token in Header:", req.headers.token);
    if (!userName || !password) {
        return res.status(400).json({ message: "Fill the required fields." });
    }
    try {
        const user = await userModel_1.User.findOne({ userName });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!SECRET_KEY) {
            return res.status(500).json({
                message: "JWT secrets are not defined in the environment variables.",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, tokenVersion: user.tokenVersion }, SECRET_KEY, { expiresIn: "1h" });
        // console.log("🟢 Generated Token:", accessToken); // ✅ Debugging line
        return res.status(200).json({
            message: "User logged in successfully.",
            accessToken,
            userId: user._id,
            userName
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
const resetPasswordWithOldPassword = async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }
    try {
        const user = await userModel_1.User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect old password." });
        }
        const saltRounds = 10;
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        if (typeof user.tokenVersion === "number") {
            user.tokenVersion += 1;
        }
        else {
            user.tokenVersion = 1;
        }
        await user.save();
        return res.status(200).json({ message: "Password updated successfully." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.resetPasswordWithOldPassword = resetPasswordWithOldPassword;
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
        return res.status(400).json({ message: "Reset token and new password are required." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(resetToken, SECRET_KEY);
        const userId = decoded.id;
        const user = await userModel_1.User.findById(userId);
        if (!user || user.resetToken !== resetToken) {
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
        const user = await userModel_1.User.findById(req.user.id).select("-password"); // Fetch user excluding the password
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Send user data as a response
        return res.status(200).json({
            userName: user.username,
            userId: user._id,
            isLoggedIn: true,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.checkAuthStatus = checkAuthStatus;
