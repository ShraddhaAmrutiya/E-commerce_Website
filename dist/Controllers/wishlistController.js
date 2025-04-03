"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.getWishlist = exports.addToWishlist = void 0;
const wishlistModel_1 = __importDefault(require("../Models/wishlistModel"));
const productModel_1 = require("../Models/productModel");
// ✅ Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.headers["userId"] || req.headers["userid"]; // Extract userId from headers
        if (!userId)
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        const { productId } = req.body;
        // Check if product exists
        const product = await productModel_1.Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        // Check if already in wishlist
        const existingWishlistItem = await wishlistModel_1.default.findOne({ userId, productId });
        if (existingWishlistItem)
            return res.status(400).json({ message: "Product already in wishlist" });
        // Add to wishlist
        const wishlistItem = new wishlistModel_1.default({ userId, productId });
        await wishlistItem.save();
        return res.status(201).json({ message: "Added to wishlist", wishlistItem });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.addToWishlist = addToWishlist;
// ✅ Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        // Fetch wishlist items with product details
        const wishlist = await wishlistModel_1.default.find({ userId }).populate("productId");
        return res.status(200).json(wishlist);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getWishlist = getWishlist;
// ✅ Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.headers["userId"] || req.headers["userid"];
        console.log("Extracted userId:", userId);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        console.log("Received userId:", userId);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        const deletedItem = await wishlistModel_1.default.findOneAndDelete({ userId, productId });
        if (!deletedItem)
            return res.status(404).json({ message: "Product not in wishlist" });
        return res.status(200).json({ message: "Product removed from wishlist" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.removeFromWishlist = removeFromWishlist;
