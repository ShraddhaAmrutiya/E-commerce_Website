import {User} from "../Models/userModel";
import express, { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Cart from "../Models/cartModel"
import bcrypt from 'bcryptjs'; 
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
import dns from "dns";
dns.setDefaultResultOrder("ipv4first"); // helps avoid IPv6 issues



dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY as string;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT )||587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  interface RegisterRequestBody {
    userName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
    Role: string;
    password: string;
  }
  
export interface LoginRequestBody {
  userName : string;
  password: string;
}


const registerUser = async (
  req: Request<{}, {}, any>,
  res: Response
) => {
  const {
    userName,
    password,
    email,
    Role,
    firstName,
    lastName,
    phone,
    age,
    gender,
  } = req.body;

  if (!userName || !password || !email) {
    return res.status(400).json({ message: req.t("auth.FillRequired") });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: req.t("auth.UserExists") });
    }

    const newUser = new User({
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

    await new Cart({ userId: newUser._id, products: [] }).save();

    const token = jwt.sign(
      { id: newUser._id, tokenVersion: newUser.tokenVersion },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: req.t("auth.Registered"),
      token,
      userId: newUser._id,
      userName: newUser.userName,
      Role: newUser.Role,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }console.log(error);
    

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};


const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: req.t("auth.FillRequired") });
  }

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: req.t("auth.UserNotFound") });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || !user) {
      return res.status(401).json({ message: req.t("auth.InvalidCredentials") });
    }

    if (!SECRET_KEY) {
      return res.status(500).json({ message: req.t("auth.JWTError") });
    }

    const accessToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: req.t("auth.LoginSuccess"),
      accessToken,
      userId: user._id,
      userName: user.userName,
      Role: user.Role,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: req.t("auth.EmailRequired") });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: req.t("auth.UseRegisteredEmail") });
    }

    const resetToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

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
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: req.t("auth.MissingTokenPassword") });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user || user.resetToken !== token) {
      return res.status(401).json({ message: req.t("auth.TokenInvalid") });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.tokenVersion += 1;
    await user.save();

    return res.status(200).json({ message: req.t("auth.ResetSuccess") });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

const resetPasswordWithOldPassword = async (req: Request, res: Response) => {
  const { userName, oldPassword, newPassword } = req.body;

  if (!userName || !oldPassword || !newPassword) {
    return res.status(400).json({ message: req.t("auth.AllFieldsRequired") });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.-=+<>?&*()]).{8,15}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ message: req.t("auth.PasswordFormat") });
  }

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: req.t("auth.UserNotFound") });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: req.t("auth.IncorrectOldPassword") });
    }

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: req.t("auth.PasswordUpdated"), token });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

const logoutUser = (req: Request, res: Response) => {
  return res.status(200).json({ message: req.t("auth.LogoutSuccess") });
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: req.t("user.NotFound") });
    }
    return res.status(200).json(user);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: req.t("auth.ServerError"), error: (error as Error).message });
  }
};

const checkAuthStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: req.t("auth.UserNotFound") });
    }

    return res.status(200).json({
      userName: user.userName,
      userId: user._id,
      isLoggedIn: true,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        const rawMsg = error.errors[field].message;
        validationErrors[field] = req.t(rawMsg) || rawMsg;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  getUser,
  getAllUsers,
  resetPasswordWithOldPassword,
  checkAuthStatus,
};