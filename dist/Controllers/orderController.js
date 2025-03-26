"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByUser = exports.placeDirectOrder = exports.placeOrderFromCart = void 0;
const orderModel_1 = __importDefault(require("../Models/orderModel"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const productModel_1 = require("../Models/productModel");
const mongoose_1 = __importDefault(require("mongoose"));
const placeOrderFromCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await cartModel_1.default.findOne({ userId }).populate("products.productId");
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        let totalPrice = 0;
        const products = cart.products.map((item) => {
            const product = item.productId;
            totalPrice += product.price * item.quantity;
            return {
                productId: product._id,
                stock: item.quantity,
            };
        });
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products,
            totalPrice,
            status: "Pending",
        });
        await newOrder.save();
        for (const item of cart.products) {
            const product = item.productId;
            await productModel_1.Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -item.quantity },
            });
        }
        await cartModel_1.default.findOneAndDelete({ userId });
        return res.status(201).json({ message: "Order placed successfully", order: newOrder });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.placeOrderFromCart = placeOrderFromCart;
// Place Direct Order (Without Adding to Cart)
const placeDirectOrder = async (req, res) => {
    try {
        const { userId, productId, stock } = req.body;
        const product = await productModel_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.stock < stock) {
            return res.status(400).json({ message: "Insufficient stock" });
        }
        const totalPrice = product.price * stock;
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products: [{ productId: new mongoose_1.default.Types.ObjectId(productId), stock }],
            totalPrice,
            status: "Pending",
        });
        await newOrder.save();
        await productModel_1.Product.findByIdAndUpdate(productId, {
            $inc: { stock: -stock },
        });
        return res.status(201).json({ message: "Direct order placed successfully", order: newOrder });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.placeDirectOrder = placeDirectOrder;
const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await orderModel_1.default.find({ userId }).populate("products.productId");
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user." });
        }
        return res.status(200).json({ message: "Orders retrieved successfully", orders });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getOrdersByUser = getOrdersByUser;
