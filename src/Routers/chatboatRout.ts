import authMiddleware from '../middleware/authMiddlewate';
import {chatboat} from "../Controllers/chatboatController"
import express from "express";

const router = express.Router();

router.post("/",chatboat)

export default router;
