"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../Controllers/orderController");
const router = express_1.default.Router();
router.post("/cart/:userId", orderController_1.placeOrderFromCart);
router.post("/direct", orderController_1.placeDirectOrder);
router.post("/:userId", orderController_1.getOrdersByUser);
exports.default = router;
