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
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// Compare passwords
UserSchema.methods.matchPassword = async function (password) {
    return await bcryptjs_1.default.compare(password, this.password);
};
UserSchema.methods.incrementTokenVersion = async function () {
    this.tokenVersion += 1;
    await this.save();
};
exports.User = (0, mongoose_1.model)("User", UserSchema);
