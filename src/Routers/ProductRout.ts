import { createProduct, readProduct, updateProduct, deleteProduct, getproductBYCategoryname,getProductById ,search} from '../Controllers/productController';
import express from 'express';
import authMiddleware from '../middleware/authMiddlewate';
import checkRole from '../middleware/admin';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();


// Define the upload directory (outside `dist`)
const uploadDir = path.join(process.cwd(), "uploads");
// Ensure `uploads/` directory exists in the root folder
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Uploads folder created at: ${uploadDir}`);
} else {
  console.log(`Uploads folder exists at: ${uploadDir}`);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Always save to root uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/create",authMiddleware, upload.single("image"),createProduct);

router.get('/all',readProduct);
router.get('/search',search);

// router.put('/update/:id', upload.single("image"), updateProduct);
router.put("/update/:id", authMiddleware, checkRole(['admin']), upload.single("image"), updateProduct);

router.delete('/delete/:_id',authMiddleware, deleteProduct);
router.get('/:_id', getProductById);

router.get("/category/:categoryname",getproductBYCategoryname);


export default router;
