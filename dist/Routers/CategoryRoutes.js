"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = require("../Controllers/CategoryController");
const productController_1 = require("../Controllers/productController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const admin_1 = __importDefault(require("../middleware/admin"));
const router = express_1.default.Router();
router.post("/add", authMiddlewate_1.default, (0, admin_1.default)(["admin"]), CategoryController_1.createCategory);
router.get("/list", CategoryController_1.getCategories);
router.get("/:id", CategoryController_1.getCategoryById);
router.put("/update/:id", authMiddlewate_1.default, (0, admin_1.default)(["admin"]), CategoryController_1.updateCategory);
router.delete("/delete/:id", authMiddlewate_1.default, (0, admin_1.default)(["admin"]), CategoryController_1.deleteCategory);
router.get("/products/:id", productController_1.getProductsByCategory);
exports.default = router;
