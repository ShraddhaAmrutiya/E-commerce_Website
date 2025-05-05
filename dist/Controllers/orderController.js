"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderRedirectButton = exports.getOrdersByUser = exports.placeDirectOrder = exports.placeOrderFromCart = void 0;
const orderModel_1 = __importDefault(require("../Models/orderModel"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const productModel_1 = require("../Models/productModel");
const userModel_1 = require("../Models/userModel");
const mongoose_1 = __importDefault(require("mongoose"));
const placeOrderFromCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        // Fetch the cart for the user and populate product details
        const cart = await cartModel_1.default.findOne({ userId }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        if (cart.products.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        // Log the entire cart object and its products to inspect what is being populated
        let totalPrice = 0;
        const products = cart.products.map((item) => {
            const product = item.productId;
            // Log the product object to inspect its structure
            if (!product) {
                return res.status(400).json({ message: "Product details missing for cart item." });
            }
            totalPrice += product.price * item.quantity;
            return {
                productId: product._id,
                quantity: item.quantity,
            };
        });
        // Create a new order with status "Pending"
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products,
            totalPrice,
            status: "Pending",
        });
        // Save the new order
        await newOrder.save();
        // Update the stock for each product in the cart
        for (const item of cart.products) {
            const product = item.productId;
            // Log the product to check if it has the stock property
            // console.log('Product for stock check:', product);
            if (!product) {
                return res.status(400).json({ message: "Product details missing for cart item." });
            }
            // Check if the product has enough stock
            if (product.stock == null || product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for product: ${product.title || 'Unknown'}` });
            }
            // Update product stock
            await productModel_1.Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -item.quantity },
            });
        }
        // Clear the cart after placing the order
        await cartModel_1.default.findOneAndDelete({ userId });
        // Return success response with the new order
        return res.status(201).json({ message: "Order placed successfully", order: newOrder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.placeOrderFromCart = placeOrderFromCart;
const placeDirectOrder = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        // Validate input
        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        // Check if user exists
        const user = await userModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch the product
        const product = await productModel_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Check stock availability
        if (product.stock === 0) {
            return res.status(400).json({ message: "Product is out of stock" });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: `Not enough stock for product: ${product.title}` });
        }
        // Calculate total price
        const totalPrice = product.salePrice * quantity;
        // Create new order
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products: [
                { productId: new mongoose_1.default.Types.ObjectId(productId), quantity }
            ],
            totalPrice,
            status: "Pending",
        });
        await newOrder.save();
        // Deduct stock
        await productModel_1.Product.findByIdAndUpdate(productId, {
            $inc: { stock: -quantity },
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
const getOrderRedirectButton = async (req, res) => {
    try {
        const { userId } = req.params;
        // Validate user ID
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        // Fetch past orders for the user
        const pastOrders = await orderModel_1.default.find({ userId }).sort({ createdAt: -1 });
        // Check if there are no past orders
        if (pastOrders.length === 0) {
            return res.status(404).json({ message: "No past orders found" });
        }
        // Build orders with product details
        const pastOrdersWithProductDetails = await Promise.all(pastOrders.map(async (order) => {
            const productsWithDetails = await Promise.all(order.products.map(async (product) => {
                const productDetails = await productModel_1.Product.findById(product.productId);
                if (!productDetails) {
                    return {
                        productId: product.productId,
                        quantity: product.quantity,
                        name: "Unknown Product",
                        description: "No description available",
                        salePrice: 0,
                        totalPrice: 0,
                        image: "/images/placeholder.jpg",
                    };
                }
                const totalPrice = productDetails.salePrice * product.quantity;
                return {
                    productId: product.productId,
                    quantity: product.quantity,
                    name: productDetails.title,
                    description: productDetails.description,
                    salePrice: productDetails.salePrice,
                    totalPrice,
                    image: productDetails.image,
                };
            }));
            // Calculate the sum of all products' totalPrice
            const orderTotal = productsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
            return {
                orderId: order._id,
                createdAt: order.createdAt,
                totalPrice: order.totalPrice,
                orderTotal, // Add this line
                status: order.status,
                products: productsWithDetails,
            };
        }));
        // Redirect to the first order
        const redirectUrl = `/orders/${pastOrdersWithProductDetails[0].orderId}`;
        return res.status(200).json({
            message: "Past orders found",
            redirectUrl,
            pastOrders: pastOrdersWithProductDetails,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getOrderRedirectButton = getOrderRedirectButton;
