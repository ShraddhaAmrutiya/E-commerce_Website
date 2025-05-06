import {User} from "../Models/userModel";
import express, { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Cart from "../Models/cartModel"
import bcrypt from 'bcryptjs'; 
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);



dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY as string;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT ),
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
  req: Request<{}, {}, RegisterRequestBody>,
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
    return res.status(400).json({ message: "Fill the required fields." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists , please use another email"})
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
      process.env.SECRET_KEY!,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      userId: newUser._id,
      userName: newUser.userName,
      Role: newUser.Role,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors: any = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors: validationErrors });
    }

    res.status(500).json({ error: error.message });
  }
};

export default registerUser;

const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { userName, password } = req.body;

  if (!userName || !password) { 
    return res.status(400).json({ message: "Please fill in both username and password." });
  }

  try {
    const user = await User.findOne({ userName });
   

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch ||!user  ) {
      return res.status(401).json({ message: "Please enter valid credentials." });
    }

    // Check if JWT secret is defined
    if (!SECRET_KEY) {
      return res.status(500).json({
        message: "JWT secrets are not defined in the environment variables.",
      });
    }

    
    const accessToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      process.env.SECRET_KEY!,
      { expiresIn: '1d' }
    );
    
    return res.status(200).json({
      message: "User logged in successfully.",
      accessToken, 
      userId: user._id, 
      userName: user.userName, 
      Role: user.Role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};


const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Ensure email is provided
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "Please enter a registered email ID." });
    }

    const resetToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      process.env.SECRET_KEY!,
      { expiresIn: '1d' }
    );

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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {

  const {  token } = req.params;
  const {  newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Reset token and new password are required." });
  }

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user || user.resetToken !== token) {
      return res.status(401).json({ message: "Invalid or expired reset token." });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.tokenVersion += 1; 
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. Please log in again." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};



const resetPasswordWithOldPassword = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password." });
    }

    user.password = newPassword;  

    user.tokenVersion += 1;

    await user.save();
    const newAccessToken = jwt.sign({ id: user._id,tokenVersion: user.tokenVersion,  }, process.env.SECRET_KEY, { expiresIn: '1h' });


    return res.status(200).json({ message: "Password updated successfully." , 
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const logoutUser = (req: Request, res: Response) => {
  return res.status(200).json({ message: "User logged out successfully." });
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); 
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

const checkAuthStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      userName: user.userName,
      userId: user._id,
      isLoggedIn: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};


export { registerUser, loginUser,forgotPassword,resetPassword ,logoutUser,getUser,getAllUsers,
  resetPasswordWithOldPassword,checkAuthStatus
};
