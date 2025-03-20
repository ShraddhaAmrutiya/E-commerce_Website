import {User} from "../Models/userModel";
import express, { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Cart from "../Models/cartModel"
import bcrypt from 'bcryptjs'; 


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
      
      await new Cart({ userId: newUser._id, products: [] }).save();

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
  


// const loginUser = async (req: Request, res: Response): Promise<Response> => {
//   const { userName, password } = req.body;

//   if (!userName || !password) {
//     return res.status(400).json({ message: "Fill the required fields." });
//   }

//   try {
//     const user = await User.findOne({ userName });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     // Compare password with the stored hashed password
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
//     });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Fill the required fields." });
  }

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!SECRET_KEY) {
      return res.status(500).json({
        message: "JWT secrets are not defined in the environment variables.",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "User logged in successfully.",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
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


  const resetPasswordWithOldPassword = async (req: Request, res: Response) => {
    const { userName, oldPassword, newPassword } = req.body;

    if (!userName || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
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

        //  Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        //  Update the user password
        user.password = hashedPassword;

        // Ensure tokenVersion exists before incrementing
        if (typeof user.tokenVersion === "number") {
            user.tokenVersion += 1;
        } else {
            user.tokenVersion = 1; // Initialize if undefined
        }

        await user.save();

        return res.status(200).json({ message: "Password updated successfully." });
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
    const decoded: any = jwt.verify(resetToken, SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user || user.resetToken !== resetToken) {
      return res.status(401).json({ message: "Invalid or expired reset token." });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.tokenVersion += 1; // Increment tokenVersion to invalidate old tokens
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. Please log in again." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};


const logoutUser = (req: Request, res: Response) => {
  return res.status(200).json({ message: "User logged out successfully." });
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password"); // Exclude password field
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
    const users = await User.find().select("-password"); // Exclude passwords for security
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export { registerUser, loginUser,forgotPassword,resetPassword ,logoutUser,getUser,getAllUsers,
  resetPasswordWithOldPassword
};
