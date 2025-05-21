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
            return res.status(400).json({ message: req.t("order.InvalidUserId") });
        }
        const cart = await cartModel_1.default.findOne({ userId }).populate("products.productId");
        if (!cart) {
            return res.status(404).json({ message: req.t("order.CartNotFound") });
        }
        if (cart.products.length === 0) {
            return res.status(400).json({ message: req.t("order.CartEmpty") });
        }
        let totalPrice = 0;
        const products = cart.products.map((item) => {
            const product = item.productId;
            if (!product) {
                return res.status(400).json({ message: req.t("order.CartEmpty") });
            }
            totalPrice += product.price * item.quantity;
            return {
                productId: product._id,
                quantity: item.quantity,
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
            if (!product) {
                return res.status(400).json({ message: "Product details missing for cart item." });
            }
            if (product.stock == null || product.stock < item.quantity) {
                return res.status(400).json({ message: req.t("order.NotEnoughStock", { title: product.title || "Unknown" }) });
            }
            await productModel_1.Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -item.quantity },
            });
        }
        await cartModel_1.default.findOneAndDelete({ userId });
        return res.status(201).json({ message: req.t("order.PlacedSuccessfully"), order: newOrder });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.placeOrderFromCart = placeOrderFromCart;
const placeDirectOrder = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: req.t("order.InvalidInput") });
        }
        const user = await userModel_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: req.t("user.NotFound") });
        }
        const product = await productModel_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: req.t("product.notFound") });
        }
        if (product.stock === 0) {
            return res.status(400).json({ message: req.t("order.OutOfStock") });
        }
        if (product.stock < quantity) {
            return res.status(400).json({
                message: req.t("order.NotEnoughStock", { product: product.title }),
            });
        }
        const totalPrice = product.salePrice * quantity;
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products: [{ productId: new mongoose_1.default.Types.ObjectId(productId), quantity }],
            totalPrice,
            status: "Pending",
        });
        await newOrder.save();
        await productModel_1.Product.findByIdAndUpdate(productId, {
            $inc: { stock: -quantity },
        });
        return res.status(201).json({
            message: req.t("order.Success"),
            order: newOrder,
        });
    }
    catch (error) {
        console.error("Order Creation Error:", error);
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.placeDirectOrder = placeDirectOrder;
const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await orderModel_1.default.find({ userId }).populate("products.productId");
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: req.t("order.NoOrders") });
        }
        return res.status(200).json({
            message: req.t("order.OrdersRetrieved"),
            orders,
        });
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getOrdersByUser = getOrdersByUser;
const getOrderRedirectButton = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: req.t("order.InvalidUserId") });
        }
        const pastOrders = await orderModel_1.default.find({ userId }).sort({ createdAt: -1 });
        if (pastOrders.length === 0) {
            return res.status(404).json({ message: req.t("order.NoPastOrders") });
        }
        const pastOrdersWithProductDetails = await Promise.all(pastOrders.map(async (order) => {
            const productsWithDetails = await Promise.all(order.products.map(async (product) => {
                const productDetails = await productModel_1.Product.findById(product.productId);
                if (!productDetails) {
                    return {
                        productId: product.productId,
                        quantity: product.quantity,
                        name: req.t("order.UnknownProduct"),
                        description: req.t("order.NoDescription"),
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
                    images: productDetails.images || [],
                };
            }));
            const orderTotal = productsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
            return {
                orderId: order._id,
                createdAt: order.createdAt,
                totalPrice: order.totalPrice,
                orderTotal,
                status: order.status,
                products: productsWithDetails,
            };
        }));
        const redirectUrl = `/orders/${pastOrdersWithProductDetails[0].orderId}`;
        return res.status(200).json({
            message: req.t("order.PastOrdersFound"),
            redirectUrl,
            pastOrders: pastOrdersWithProductDetails,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getOrderRedirectButton = getOrderRedirectButton;
