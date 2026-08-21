import express from "express";
import { getGoogleReviews } from "../Controllers/googlrController";

const router = express.Router();

// Get reviews for frontend
router.get("/", getGoogleReviews);

export default router;
