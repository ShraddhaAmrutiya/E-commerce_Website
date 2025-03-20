import express from "express";
import { placeOrderFromCart, placeDirectOrder,getOrdersByUser } from "../Controllers/orderController";
import authMiddleware from '../middleware/authMiddlewate'

const router = express.Router();

router.post("/cart/:userId",authMiddleware, placeOrderFromCart); 
router.post("/direct", authMiddleware, placeDirectOrder); 
router.post("/:userId", authMiddleware, getOrdersByUser); 

export default router;
