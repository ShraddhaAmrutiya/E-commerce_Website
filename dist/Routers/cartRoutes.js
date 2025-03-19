"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartcontroller_1 = require("../Controllers/cartcontroller");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const router = express_1.default.Router();
// Get cart by userId
router.get("/:userId", authMiddlewate_1.default, cartcontroller_1.getCart);
// Update product quantity in cart
router.put("/", authMiddlewate_1.default, cartcontroller_1.updateCart);
// Remove product from cart
router.delete("/", authMiddlewate_1.default, cartcontroller_1.removeFromCart);
// Clear entire cart
router.delete("/:userId", authMiddlewate_1.default, cartcontroller_1.clearCart);
exports.default = router;
