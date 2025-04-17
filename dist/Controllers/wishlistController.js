"use strict";
// import { Request, Response } from "express";
// import Wishlist from "../Models/wishlistModel";
// import {Product} from "../Models/productModel";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.getWishlist = exports.addToWishlist = void 0;
const wishlistModel_1 = __importDefault(require("../Models/wishlistModel"));
const productModel_1 = require("../Models/productModel");
const addToWishlist = async (req, res) => {
    try {
        // Standardize the header name (always use "userId")
        const userId = req.headers["userid"];
        if (!userId) {
            return res.status(400).json({ message: "Bad Request: User ID missing" });
        }
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        // Check if the product exists in the database
        const product = await productModel_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Check if the product is already in the user's wishlist
        const existingWishlistItem = await wishlistModel_1.default.findOne({ userId, productId });
        if (existingWishlistItem) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }
        // Add the product to the wishlist
        const wishlistItem = new wishlistModel_1.default({ userId, productId });
        await wishlistItem.save();
        return res.status(201).json({ message: "Added to wishlist", wishlistItem });
    }
    catch (error) {
        // Log the error for better debugging
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.addToWishlist = addToWishlist;
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        const wishlist = await wishlistModel_1.default.find({ userId }).populate("productId", "title price image");
        return res.status(200).json(wishlist);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getWishlist = getWishlist;
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.headers["userId"] || req.headers["userid"];
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
