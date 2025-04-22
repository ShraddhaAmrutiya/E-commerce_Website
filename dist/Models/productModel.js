"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.ObjectId,
        auto: true, // Automatically generates an _id
    },
    title: {
        type: String,
        // required: true,
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
        get: Math.floor,
        set: Math.floor
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
    seller: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
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
