import mongoose, { Schema, model, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  _id: string;
  userName: string;
  email: string;
  password: string;
  Role: "admin" | "user";
  matchPassword(password: string): Promise<boolean>;
  resetToken?: string,
}

const UserSchema: Schema<IUser> = new Schema({
  userName: {
    type: String,
    required: [true, "userName is required"],
    unique: true,
    match: [/^[a-zA-Z._\s0-9-]{3,20}$/, "Please enter a valid user name."],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-z0-9]+(?:\.[a-z0-9]+)*@[a-z0-9-]+\.(?:com|in|biz)$/,
      "Enter valid",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "password must be 8 cherecter long."],
  },
  Role: { type: String, enum: ["admin", "user"], default: "user" },
  resetToken: String,
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
