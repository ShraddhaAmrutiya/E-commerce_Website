"use strict";
// import mongoose, { Schema, Document } from "mongoose";
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
// interface IWishlist extends Document {
//   userId: mongoose.Types.ObjectId;
//   productId: mongoose.Types.ObjectId;
// }
// const wishlistSchema = new Schema<IWishlist>(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//   },
//   { timestamps: true }
// );
// const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
// export default Wishlist;
const mongoose_1 = __importStar(require("mongoose"));
const wishlistItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
}, { _id: true });
const wishlistSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    products: [wishlistItemSchema],
}, { timestamps: true });
const Wishlist = mongoose_1.default.model("Wishlist", wishlistSchema);
exports.default = Wishlist;
