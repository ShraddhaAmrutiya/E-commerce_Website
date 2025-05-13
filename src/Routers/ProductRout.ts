import {
  createProduct,
  readProduct,
  updateProduct,
  deleteProduct,
  getproductBYCategoryname,
  getProductById,
  search,
  updateProductImage,
  deleteProductImage,
  addProductImages,
} from "../Controllers/productController";
import express from "express";
import authMiddleware from "../middleware/authMiddlewate";
import checkRole from "../middleware/admin";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Uploads folder created at: ${uploadDir}`);
} else {
  console.log(`Uploads folder exists at: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });



router.post(
  "/create",
  authMiddleware,
  checkRole(["admin", "seller"]),
  upload.fields([{ name: "images", maxCount: 5 }]),
  createProduct
);

router.get("/all", readProduct);
router.get("/search", search);

router.put(
  "/update/:id",
  authMiddleware,
  checkRole(["admin", "seller"]),
  upload.fields([{ name: "images", maxCount: 5 }]),
  updateProduct
);

router.delete("/delete/:_id", authMiddleware, checkRole(["admin", "seller"]), deleteProduct);
router.get("/:_id", getProductById);

router.get("/category/:categoryname", getproductBYCategoryname);
router.put(
  "/:productId/images/:index",
  authMiddleware,
  checkRole(["admin", "seller"]),
  upload.single("image"),
  updateProductImage
);

router.delete("/:productId/images/:index", authMiddleware, checkRole(["admin", "seller"]), deleteProductImage);

router.post(
  "/:productId/images",
  authMiddleware,
  checkRole(["admin", "seller"]),
  upload.array("images", 5),
  addProductImages
);

export default router;
