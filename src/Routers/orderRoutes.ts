import express from "express";
import multer from "multer";
import { placeOrderFromCart, placeDirectOrder,getOrdersByUser,getOrderRedirectButton } from "../Controllers/orderController";
import authMiddleware from '../middleware/authMiddlewate'
const storage = multer.memoryStorage(); // store file in memory
const upload = multer({ storage });
const router = express.Router();

router.post("/cart/:userId", authMiddleware, placeOrderFromCart); 
router.post("/direct",authMiddleware, upload.single("customImage"), placeDirectOrder); 
router.post("/:userId",authMiddleware, getOrdersByUser); 
router.get('/redirect/:userId', getOrderRedirectButton);

export default router;
