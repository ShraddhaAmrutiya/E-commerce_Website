import express from "express";
import { submitInquiry, getInquiries } from "../Controllers/inquiryController";

const router = express.Router();

router.post("/", submitInquiry);
router.get("/", getInquiries);

export default router;
