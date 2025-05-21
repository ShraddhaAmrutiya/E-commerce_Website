"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reviewController_1 = require("../Controllers/reviewController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/products/:id/", authMiddlewate_1.default, reviewController_1.addReview);
router.get("/products/:id/", reviewController_1.getReviews);
exports.default = router;
