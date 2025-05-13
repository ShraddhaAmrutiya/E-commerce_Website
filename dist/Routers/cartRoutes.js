"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartcontroller_1 = require("../Controllers/cartcontroller");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const router = express_1.default.Router();
router.get("/:userId", authMiddlewate_1.default, cartcontroller_1.getCart);
router.put("/", authMiddlewate_1.default, cartcontroller_1.updateCart);
router.delete("/", authMiddlewate_1.default, cartcontroller_1.removeFromCart);
router.delete("/:userId", authMiddlewate_1.default, cartcontroller_1.clearCart);
router.put("/increase", authMiddlewate_1.default, cartcontroller_1.increaseQuantity);
router.put("/decrease", authMiddlewate_1.default, cartcontroller_1.decreaseQuantity);
exports.default = router;
