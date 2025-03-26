"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        auto: true, // Automatically generates an _id
    },
    title: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9\s.,'-]{3,100}$/, "Please enter a valid title."],
    },
    description: {
        type: String,
        match: [
            /^[a-zA-Z0-9\s.,'-]{1,1000}$/,
            "Please enter a valid description.",
        ],
    },
    image: {
        type: String,
        match: [/\.(jpg|jpeg|png)$/i, "Image must be a .jpg, .jpeg, or .png file."],
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be a positive number."],
    },
    salePrice: {
        type: Number,
        min: [0, "Sale price must be a positive number."],
    },
    discountPercentage: {
        type: Number,
        min: [0, "Discount must be a positive number."],
        max: [100, "Discount cannot exceed 100."],
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId, ref: "Category"
    },
    brand: {
        type: String,
    },
    stock: {
        type: Number,
        min: [0, "Stock must be a non-negative number."],
    },
    rating: {
        type: Number,
        default: 0, // Ensures no undefined values
    },
}, { timestamps: true });
// Auto-calculate salePrice if discountPercentage exists
ProductSchema.pre("save", function (next) {
    if (this.discountPercentage) {
        this.salePrice = this.price - this.price * (this.discountPercentage / 100);
    }
    else {
        this.salePrice = this.price;
    }
    next();
});
exports.Product = (0, mongoose_1.model)("Product", ProductSchema);
