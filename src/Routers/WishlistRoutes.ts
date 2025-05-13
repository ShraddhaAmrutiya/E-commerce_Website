import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../Controllers/wishlistController";
import authMiddleware from "../middleware/authMiddlewate";

const router = express.Router();


router.post("/add", authMiddleware, addToWishlist);
router.get("/:userId", authMiddleware, getWishlist);
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);

export default router;
