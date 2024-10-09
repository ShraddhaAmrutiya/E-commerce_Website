import {User} from "../Models/userModel";
import express, { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY as string;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export interface RegisterRequestBody {
  userName: string;
  email:string
  password: string;
  Role?: string;
}

export interface LoginRequestBody {
  userName: string;
  password: string;
}


const registerUser = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response
  ) => {
    const { userName, password,email, Role } = req.body;
  
    if (!userName || !password ||!email) {
      return res.status(400).send({ message: "Fill the required fields." });
    }
   
  
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
      const newUser = new User({
        userName,
        email,
        password,
        Role: Role ,
      });
      await newUser.save();
  
      res.status(201).json({
        message: "User registered successfully",
        _id: newUser._id,
        userName: newUser.userName,
      });
    } catch (error) {
      res
        .status(500)
        .send({  error: (error as Error).message });
    }
  };
  

const loginUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<Response> => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Fill the required fields." });
  }

  try {
    const user = await User.findOne({ userName });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!SECRET_KEY) {
      return res.status(500).json({
        message: "JWT secrets are not defined in the environment variables.",
      });
    }

    const accessToken = jwt.sign({ id: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "User logged in successfully.",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({  error: (error as Error).message });
  }
};
 const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      const resetToken = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "15m" });
      user.resetToken = resetToken;
      await user.save();
  
      const mailOptions = {
        from:'"Support Team" <process.env.EMAIL_USER>',
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Use the following token to reset your password: ${resetToken}`,
        html: `<p>You requested a password reset.</p>
               <p>Use the following token to reset your password:</p>
               <p><strong>${resetToken}</strong></p>`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.status(200).json({ message: "Reset token sent to email." });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  };

const resetPassword = async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;
  
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required." });
    }
  
    try {
      const decoded: any = jwt.verify(resetToken, process.env.SECRET_KEY as string);
      const userId = decoded.id;
  
      const user = await User.findById(userId);
      if (!user || user.resetToken !== resetToken) {
        return res.status(401).json({ message: "Invalid or expired reset token." });
      }
  
      user.password = newPassword; 
      user.resetToken = undefined; 
      await user.save();
  
      return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: (error as Error).message });
    }
  };
 
const logoutUser = (req: Request, res: Response) => {
  return res.status(200).json({ message: "User logged out successfully." });
};
export { registerUser, loginUser,forgotPassword,resetPassword ,logoutUser};
