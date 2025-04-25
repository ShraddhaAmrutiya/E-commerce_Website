"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
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
        // required: [true, "Password is required"],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^.-=+<>?&*()]).{8,15}$/, "Password must be at least 8 characters and include upper, lower, number and special character"],
    },
    resetToken: { type: String },
    tokenVersion: { type: Number, default: 0 },
});
// ✅ Hash password before save
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// ✅ Compare passwords
UserSchema.methods.matchPassword = async function (password) {
    return await bcryptjs_1.default.compare(password, this.password);
};
UserSchema.methods.incrementTokenVersion = async function () {
    this.tokenVersion += 1;
    await this.save();
};
exports.User = (0, mongoose_1.model)("User", UserSchema);
