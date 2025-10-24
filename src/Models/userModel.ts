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
  password?: string;
  resetToken?: string;
  tokenVersion: number;
  matchPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  userName: {
    type: String,
    required: [true, "validation.usernameRequired"],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]{3,50}$/, "validation.invalidUsername"],
  },
  firstName: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z0-9._-]{3,50}$/, "validation.invalidFirstName"],
  },
  lastName: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z0-9._-]{3,50}$/, "validation.invalidLastName"],
  },
  email: {
    type: String,
    required: [true, "validation.emailRequired"],
    unique: true,
    trim: true,
    match: [/^[a-z0-9]+(?:\.[a-z0-9]+)*@[a-z0-9-]+\.(?:com|in)$/i, "validation.invalidEmail"],
  },
  phone: {
    type: String,
    match: [/^(\+?\d{10,15})$/, "validation.invalidPhone"],
  },
  // age: {
  //   type: Number,
  //   min: [12, "validation.ageMin"],
  //   max: [100, "validation.ageMax"],
  // },
  gender: { type: String },
  Role: {
    type: String,
    required: [true, "validation.roleRequired"],
    enum: {
      values: ["customer", "seller", "admin"],
      message: "validation.invalidRole",
    },
    default: "customer",
  },
  password: {
    type: String,
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.-=+<>?&*()]).{8,15}$/, "validation.invalidPassword"],
  },
  resetToken: { type: String },
  tokenVersion: { type: Number, default: 0 },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
UserSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.incrementTokenVersion = async function () {
  this.tokenVersion += 1;
  await this.save();
};

export const User = model<IUser>("User", UserSchema);
