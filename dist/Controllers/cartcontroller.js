"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decreaseQuantity = exports.increaseQuantity = exports.clearCart = exports.removeFromCart = exports.updateCart = exports.getCart = void 0;
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const cart = await cartModel_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            .populate("products.productId");
        if (!cart) {
            return res.status(200).json({ cartItems: [], cartCount: 0 });
        }
        const cartItems = cart.products;
        const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
        return res.status(200).json({ cartItems, cartCount });
    }
    catch (error) {
        console.error(" Backend Error:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getCart = getCart;
const updateCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId) || !mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid userId or productId format" });
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive integer" });
        }
        let cart = await cartModel_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        if (!cart) {
            cart = new cartModel_1.default({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                products: [{ productId: new mongoose_1.default.Types.ObjectId(productId), quantity }],
            });
            await cart.save();
        }
        else {
            if (!Array.isArray(cart.products)) {
                cart.products = [];
            }
            const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
            const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));
            if (productIndex >= 0) {
                cart.products[productIndex].quantity = quantity;
            }
            else {
                cart.products.push({ productId: productObjectId, quantity });
            }
            await cart.save();
        }
        const updatedCart = await cartModel_1.default.findOne({ userId: userId }).populate("products.productId");
        const cartItems = updatedCart?.products || [];
        return res.status(200).json({
            message: "Cart updated successfully",
            cartItems,
            cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        });
    }
    catch (error) {
        console.error("Error updating cart:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
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
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart) {
            return res.status(200).json({ items: [] }); // returns empty cart
        }
        await cartModel_1.default.findOneAndDelete({ userId });
        return res.status(200).json({ message: "Cart cleared successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.clearCart = clearCart;
const increaseQuantity = async (req, res) => {
    const { userId, productId } = req.body;
    if (!userId || !productId)
        return res.status(400).json({ message: 'Missing parameters' });
    try {
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });
        const item = cart.products.find((item) => item.productId.toString() === productId);
        if (item) {
            item.quantity += 1;
        }
        else {
            cart.products.push({ productId, quantity: 1 });
        }
        await cart.save();
        res.status(200).json({ message: 'Quantity increased', cartItems: cart.products });
    }
    catch (error) {
        console.error('Increase error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.increaseQuantity = increaseQuantity;
const decreaseQuantity = async (req, res) => {
    const { userId, productId } = req.body;
    if (!userId || !productId)
        return res.status(400).json({ message: 'Missing parameters' });
    try {
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });
        const item = cart.products.find((item) => item.productId.toString() === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            }
            else {
                cart.products = cart.products.filter((item) => item.productId.toString() !== productId);
            }
            await cart.save();
            res.status(200).json({ message: 'Quantity decreased', cartItems: cart.products });
        }
        else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    }
    catch (error) {
        console.error('Decrease error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.decreaseQuantity = decreaseQuantity;
