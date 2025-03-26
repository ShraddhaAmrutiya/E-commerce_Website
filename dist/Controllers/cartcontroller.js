"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCart = exports.getCart = void 0;
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await cartModel_1.default.findOne({ userId }).populate("products.productId");
        if (!cart) {
            return res.status(404).json({ message: "Cart is Empty" });
        }
        return res.status(200).json(cart);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getCart = getCart;
const updateCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let cart = await cartModel_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        if (!cart) {
            cart = new cartModel_1.default({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                products: [{ productId: new mongoose_1.default.Types.ObjectId(productId), quantity }]
            });
            await cart.save();
            return res.status(201).json({ message: "New cart created with product", cart });
        }
        const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
        const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));
        if (productIndex >= 0) {
            // 🔹 Update stock if product exists
            cart.products[productIndex].quantity = quantity;
        }
        else {
            // 🔹 Add product if it doesn't exist in cart
            cart.products.push({ productId: productObjectId, quantity });
        }
        await cart.save();
        return res.status(200).json({
            message: "Cart updated",
            cart
        });
    }
    catch (error) {
        console.error("Error updating cart:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.updateCart = updateCart;
const removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        let cart = await cartModel_1.default.findOne({ userId: userObjectId })
            .populate({
            path: "products.productId",
            model: "Product", // Ensure it explicitly refers to the Product model
            select: "title"
        });
        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }
        const productToRemove = cart.products.find((p) => p.productId.equals(productObjectId));
        if (!productToRemove) {
            return res.status(404).json({ message: "Product not found in cart" });
        }
        // Get product name correctly
        const removedProductName = productToRemove.productId?.title || "Unknown Product";
        cart.products = cart.products.filter((p) => !p.productId.equals(productObjectId));
        await cart.save();
        return res.status(200).json({
            message: ` ${removedProductName} removed from cart`,
        });
    }
    catch (error) {
        console.error("Error removing product from cart:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        await cartModel_1.default.findOneAndDelete({ userId });
        res.status(200).json({ message: 'Cart cleared successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.clearCart = clearCart;
