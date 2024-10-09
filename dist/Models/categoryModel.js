"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        match: [/^[a-zA-Z._\s-]{3,20}$/, "Please enter a valid user name."],
    },
    description: {
        type: String,
        match: [
            /^[a-zA-Z0-9\s.,'-]{5,1000}$/,
            "Please enter a valid description.",
        ],
    },
}, { timestamps: true });
exports.Category = (0, mongoose_1.model)("Category", CategorySchema);
