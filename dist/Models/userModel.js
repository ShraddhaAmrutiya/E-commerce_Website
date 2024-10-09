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
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
UserSchema.methods.matchPassword = async function (password) {
    return await bcryptjs_1.default.compare(password, this.password);
};
exports.User = (0, mongoose_1.model)("User", UserSchema);
