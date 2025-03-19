import express from "express";
import { getCart, updateCart, removeFromCart, clearCart } from "../Controllers/cartcontroller";
import authMiddleware from '../middleware/authMiddlewate';
import isAdmin from '../middleware/admin';


const router = express.Router();

// Get cart by userId
router.get("/:userId",authMiddleware, getCart);

// Update product quantity in cart
router.put("/",authMiddleware, updateCart);

// Remove product from cart
router.delete("/", authMiddleware,removeFromCart);

// Clear entire cart
router.delete("/:userId", authMiddleware,clearCart);

export default router;
