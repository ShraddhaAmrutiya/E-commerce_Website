import { addReview, getReviews } from "../Controllers/reviewController"; 
import authMiddleware from '../middleware/authMiddlewate'
import express from "express";
const router = express.Router();


router.post("/products/:id/", authMiddleware, addReview);
router.get("/products/:id/", getReviews);

export default router;
