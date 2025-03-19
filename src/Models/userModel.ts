import mongoose, { Schema, model, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends mongoose.Document {
  userName: string;
  email: string;
  Role:string
  password: string;
  resetToken?: string;
  tokenVersion: number; // Add this field to track token invalidation
}

const UserSchema = new mongoose.Schema<IUser>({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  Role: { type: String, required: true,  },
  password: { type: String, required: true },
  resetToken: { type: String },
  tokenVersion: { type: Number, default: 0 } // Default value is 0
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const User = model<IUser>("User", UserSchema);
