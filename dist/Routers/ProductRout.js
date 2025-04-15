"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productController_1 = require("../Controllers/productController");
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Define the upload directory (outside `dist`)
const uploadDir = path_1.default.join(process.cwd(), "uploads");
// Ensure `uploads/` directory exists in the root folder
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    console.log(`Uploads folder created at: ${uploadDir}`);
}
else {
    console.log(`Uploads folder exists at: ${uploadDir}`);
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Always save to root uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post("/create", upload.single("image"), productController_1.createProduct);
router.get('/all', productController_1.readProduct);
router.get('/search', productController_1.search);
router.put('/update/:id', upload.single("image"), productController_1.updateProduct);
router.delete('/delete/:_id', productController_1.deleteProduct);
router.get('/:_id', productController_1.getProductById);
router.get("/category/:categoryname", productController_1.getproductBYCategoryname);
exports.default = router;
