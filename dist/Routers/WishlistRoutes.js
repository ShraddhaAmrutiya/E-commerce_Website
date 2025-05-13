"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = require("../Controllers/wishlistController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const router = express_1.default.Router();
router.post("/add", authMiddlewate_1.default, wishlistController_1.addToWishlist);
router.get("/:userId", authMiddlewate_1.default, wishlistController_1.getWishlist);
router.delete("/remove/:productId", authMiddlewate_1.default, wishlistController_1.removeFromWishlist);
exports.default = router;
