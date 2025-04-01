import express from "express";
import { getCart, updateCart, removeFromCart, clearCart } from "../Controllers/cartcontroller";
import authMiddleware from '../middleware/authMiddlewate';
import isAdmin from '../middleware/admin';


const router = express.Router();

router.get("/:userId", authMiddleware,getCart);

router.put("/", updateCart);

router.delete("/",removeFromCart);

router.delete("/:userId",clearCart);

export default router;
