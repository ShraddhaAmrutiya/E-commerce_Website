"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productController_1 = require("../Controllers/productController");
const express_1 = __importDefault(require("express"));
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const admin_1 = __importDefault(require("../middleware/admin"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const uploadDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    console.log(`Uploads folder created at: ${uploadDir}`);
}
else {
    console.log(`Uploads folder exists at: ${uploadDir}`);
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
router.post("/create", authMiddlewate_1.default, (0, admin_1.default)(["admin", "seller"]), upload.fields([{ name: "images", maxCount: 5 }]), productController_1.createProduct);
router.get("/all", productController_1.readProduct);
router.get("/search", productController_1.search);
router.put("/update/:id", authMiddlewate_1.default, (0, admin_1.default)(["admin", "seller"]), upload.fields([{ name: "images", maxCount: 5 }]), productController_1.updateProduct);
router.delete("/delete/:_id", authMiddlewate_1.default, (0, admin_1.default)(["admin", "seller"]), productController_1.deleteProduct);
router.get("/:_id", productController_1.getProductById);
router.get("/category/:categoryname", productController_1.getproductBYCategoryname);
router.put("/:productId/images/:index", authMiddlewate_1.default, (0, admin_1.default)(["admin", "seller"]), upload.single("image"), productController_1.updateProductImage);
router.delete("/:productId/images/:index", authMiddlewate_1.default, (0, admin_1.default)(["admin", "seller"]), productController_1.deleteProductImage);
router.post("/:productId/images", authMiddlewate_1.default, (0, admin_1.default)(["admin", "seller"]), upload.array("images", 5), productController_1.addProductImages);
exports.default = router;
