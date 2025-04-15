import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  Role: string;
  password: string;
  resetToken?: string;
  tokenVersion: number;
  matchPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]{3,50}$/, "Please enter a valid user name."],
  },
  firstName: { type: String, trim: true, match: [/^[a-zA-Z0-9._-]{3,50}$/, "Please enter a valid first name."] },
  lastName: { type: String, trim: true, match: [/^[a-zA-Z0-9._-]{3,50}$/, "Please enter a valid last name."] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    match: [/^[a-z0-9]+(?:\.[a-z0-9]+)*@[a-z0-9-]+\.(?:com|in)$/i, "Please enter a valid email ."],
  },
  phone: {
    type: String,
    match: [/^(\+?\d{10,15})$/, "Please enter a valid phone number."],
  },  
  age: {
    type: Number,
    min: [12, "Age must be at least 12"],
    max: [100, "Age must be less than or equal to 100"],
  },
  gender: { type: String },
    Role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
    password: {
    type: String,
    required: [true, "Password is required"],
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.-=+<>?&*()]).{8,15}$/, "password length must be 8"],
  },
  resetToken: { type: String },
  tokenVersion: { type: Number, default: 0 },
});

// ✅ Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare passwords
UserSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = model<IUser>("User", UserSchema);
