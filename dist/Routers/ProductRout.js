"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productController_1 = require("../Controllers/productController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const multer_1 = __importDefault(require("multer"));
const admin_1 = __importDefault(require("../middleware/admin"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post("/create", authMiddlewate_1.default, admin_1.default, upload.single("image"), productController_1.createProduct);
router.get('/', productController_1.readProduct);
router.put('/update/:id', authMiddlewate_1.default, productController_1.updateProduct);
router.delete('/:id', authMiddlewate_1.default, productController_1.deleteProduct);
router.get("/category/:categoryName", productController_1.getProductsByCategory);
exports.default = router;
