"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCart = exports.getCart = void 0;
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// export const getCart = async (req: Request, res: Response) => {
//   try {
//     console.log("Received request for user ID:");
//     console.log("Request Headers:", req.headers);
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }
//     const token = authHeader.split(" ")[1]; // Extract token
//     console.log("Extracted Token:", token); // ✅ Debugging line
//     const { userId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID format" });
//     }
//     const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
//       .populate("products.productId");
//     if (!cart) {
//       return res.status(404).json({ message: "Cart is Empty" });
//     }
//     return res.status(200).json(cart);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const cart = await cartModel_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            .populate("products.productId");
        if (!cart) {
            return res.status(404).json({ message: "Cart is Empty" });
        }
        return res.status(200).json(cart);
    }
    catch (error) {
        console.error("❌ Backend Error:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getCart = getCart;
// export const updateCart = async (req: Request, res: Response) => {
//   const { userId, productId, quantity } = req.body;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Invalid userId or productId format" });
//     }
//     let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
//     if (!cart) {
//       cart = new Cart({
//         userId: new mongoose.Types.ObjectId(userId),
//         products: [{ productId: new mongoose.Types.ObjectId(productId), quantity }],
//       });
//       await cart.save();
//       return res.status(201).json({ message: "New cart created with product", cart });
//     }
//     const productObjectId = new mongoose.Types.ObjectId(productId);
//     const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));
//     if (productIndex >= 0) {
//       cart.products[productIndex].quantity = quantity;
//     } else {
//       cart.products.push({ productId: productObjectId, quantity });
//     }
//     await cart.save();
//     return res.status(200).json({ message: "Cart updated", cart });
//   } catch (error) {
//     console.error("Error updating cart:", error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
const updateCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        // 🔥 Validate `userId` and `productId` format
        if (!mongoose_1.default.Types.ObjectId.isValid(userId) || !mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid userId or productId format" });
        }
        // 🔥 Validate `quantity`
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive integer" });
        }
        let cart = await cartModel_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        if (!cart) {
            // 🔥 Create new cart if none exists
            cart = new cartModel_1.default({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                products: [{ productId: new mongoose_1.default.Types.ObjectId(productId), quantity }],
            });
            await cart.save();
            return res.status(201).json({ message: "New cart created with product", cart });
        }
        // 🔥 Ensure `products` array exists
        if (!Array.isArray(cart.products)) {
            cart.products = [];
        }
        const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
        const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));
        if (productIndex >= 0) {
            // 🔥 Update existing product quantity
            cart.products[productIndex].quantity = quantity;
        }
        else {
            // 🔥 Add new product to cart
            cart.products.push({ productId: productObjectId, quantity });
        }
        await cart.save();
        return res.status(200).json({ message: "Cart updated successfully", cart });
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
        await cartModel_1.default.findOneAndDelete({ userId });
        res.status(200).json({ message: 'Cart cleared successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.clearCart = clearCart;
