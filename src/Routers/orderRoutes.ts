import express from "express";
import { placeOrderFromCart, placeDirectOrder,getOrdersByUser,getOrderRedirectButton } from "../Controllers/orderController";
import authMiddleware from '../middleware/authMiddlewate'

const router = express.Router();

router.post("/cart/:userId", authMiddleware, placeOrderFromCart); 
router.post("/direct",authMiddleware, placeDirectOrder); 
router.post("/:userId",authMiddleware, getOrdersByUser); 
router.get('/redirect/:userId', getOrderRedirectButton);

export default router;
