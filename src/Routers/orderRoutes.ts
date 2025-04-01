import express from "express";
import { placeOrderFromCart, placeDirectOrder,getOrdersByUser } from "../Controllers/orderController";
import authMiddleware from '../middleware/authMiddlewate'

const router = express.Router();

router.post("/cart/:userId", placeOrderFromCart); 
router.post("/direct", placeDirectOrder); 
router.post("/:userId", getOrdersByUser); 

export default router;
