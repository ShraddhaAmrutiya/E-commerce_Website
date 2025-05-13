import express from "express";
import {
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
} from "../Controllers/cartcontroller";
import authMiddleware from "../middleware/authMiddlewate";
import Cart from "../Models/cartModel";
import checkRole from "../middleware/admin";

const router = express.Router();

router.get("/:userId", authMiddleware, getCart);
router.put("/", authMiddleware, updateCart);
router.delete("/", authMiddleware, removeFromCart);
router.delete("/:userId", authMiddleware, clearCart);
router.put("/increase", authMiddleware, increaseQuantity);
router.put("/decrease", authMiddleware, decreaseQuantity);

export default router;
