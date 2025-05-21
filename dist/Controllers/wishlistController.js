"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.getWishlist = exports.addToWishlist = void 0;
const wishlistModel_1 = __importDefault(require("../Models/wishlistModel"));
const productModel_1 = require("../Models/productModel");
const addToWishlist = async (req, res) => {
    try {
        const userId = req.headers["userid"];
        if (!userId) {
            return res.status(400).json({ message: req.t("wishlist.UserIdMissing") });
        }
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: req.t("wishlist.ProductIdRequired") });
        }
        const product = await productModel_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: req.t("wishlist.ProductNotFound") });
        }
        let wishlist = await wishlistModel_1.default.findOne({ userId });
        if (!wishlist) {
            wishlist = new wishlistModel_1.default({
                userId,
                products: [{ productId, quantity: 1 }],
            });
        }
        else {
            const existingItem = wishlist.products.find((item) => item.productId.equals(productId));
            if (existingItem) {
                return res.status(400).json({ message: req.t("wishlist.AlreadyInWishlist") });
            }
            wishlist.products.push({ productId, quantity: 1 });
        }
        await wishlist.save();
        return res.status(201).json({ message: req.t("wishlist.AddedSuccess"), wishlist });
    }
    catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ message: req.t("wishlist.InternalError") });
    }
};
exports.addToWishlist = addToWishlist;
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: req.t("wishlist.UserIdRequired") });
        }
        const wishlist = await wishlistModel_1.default.find({ userId })
            .populate('products.productId', 'title price salePrice images')
            .exec();
        return res.status(200).json(wishlist);
    }
    catch (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({ message: req.t("wishlist.InternalError") });
    }
};
exports.getWishlist = getWishlist;
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.headers["userid"];
        if (!userId) {
            return res.status(401).json({ message: req.t("wishlist.UserIdMissing") });
        }
        const wishlist = await wishlistModel_1.default.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({ message: req.t("wishlist.WishlistNotFound") });
        }
        const productIndex = wishlist.products.findIndex((item) => item.productId.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ message: req.t("wishlist.ProductNotInWishlist") });
        }
        wishlist.products.splice(productIndex, 1);
        await wishlist.save();
        return res.status(200).json({ message: req.t("wishlist.RemovedSuccess") });
    }
    catch (error) {
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({ message: req.t("wishlist.InternalError") });
    }
};
exports.removeFromWishlist = removeFromWishlist;
