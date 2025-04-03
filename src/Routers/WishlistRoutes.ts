import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../Controllers/wishlistController";
import authMiddleware from "../middleware/authMiddlewate";

const router = express.Router();

// 🔹 Add product to wishlist
router.post("/add", authMiddleware, addToWishlist);

// 🔹 Get wishlist items
router.get("/:userId", authMiddleware, getWishlist);

// 🔹 Remove product from wishlist
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);

export default router;
