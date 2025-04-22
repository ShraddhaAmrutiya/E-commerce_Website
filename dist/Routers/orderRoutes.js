"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../Controllers/orderController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const router = express_1.default.Router();
router.post("/cart/:userId", authMiddlewate_1.default, orderController_1.placeOrderFromCart);
router.post("/direct", authMiddlewate_1.default, orderController_1.placeDirectOrder);
router.post("/:userId", authMiddlewate_1.default, orderController_1.getOrdersByUser);
router.get('/redirect/:userId', orderController_1.getOrderRedirectButton);
exports.default = router;
