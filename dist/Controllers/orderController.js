"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByUser = exports.placeDirectOrder = exports.placeOrderFromCart = void 0;
const orderModel_1 = __importDefault(require("../Models/orderModel"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const productModel_1 = require("../Models/productModel");
const userModel_1 = require("../Models/userModel");
const mongoose_1 = __importDefault(require("mongoose"));
// export const placeOrderFromCart = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const cart = await Cart.findOne({ userId }).populate("products.productId");
//     if (!cart || cart.products.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }
//     let totalPrice = 0;
//     const products = cart.products.map((item) => {
//       const product = item.productId as any;
//       totalPrice += product.price * item.quantity;
//       return {
//         productId: product._id,
//         stock: item.quantity,
//       };
//     });
//     const newOrder = new Order({
//       userId: new mongoose.Types.ObjectId(userId),
//       products,
//       totalPrice,
//       status: "Pending",
//     });
//     await newOrder.save();
//     for (const item of cart.products) {
//       const product = item.productId as any;
//       await Product.findByIdAndUpdate(product._id, {
//         $inc: { stock: -item.quantity },
//       });
//     }
//     await Cart.findOneAndDelete({ userId });
//     return res.status(201).json({ message: "Order placed successfully", order: newOrder });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
// Place Direct Order (Without Adding to Cart)
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
        // Create the new order with status "Pending"
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products,
            totalPrice,
            status: "Pending", // Set the order status to "Pending"
        });
        await newOrder.save();
        // Update the product stock and remove cart items
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
const placeDirectOrder = async (req, res) => {
    try {
        const { userId, productId, stock } = req.body;
        const user = await userModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
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
            products: [{ productId: new mongoose_1.default.Types.ObjectId(productId), quantity: stock }], // 🔹 Fix: Use `quantity`
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
        console.error("Order Creation Error:", error);
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
