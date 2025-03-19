"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = require("../Controllers/CategoryController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const admin_1 = __importDefault(require("../middleware/admin"));
const router = express_1.default.Router();
router.post('/add', authMiddlewate_1.default, admin_1.default, CategoryController_1.createCategory);
router.get('/list', authMiddlewate_1.default, CategoryController_1.getCategories);
router.get('/:id', authMiddlewate_1.default, admin_1.default, CategoryController_1.getCategoryById);
router.put('/:id', authMiddlewate_1.default, admin_1.default, CategoryController_1.updateCategory);
router.delete('/:id', authMiddlewate_1.default, admin_1.default, CategoryController_1.deleteCategory);
exports.default = router;
