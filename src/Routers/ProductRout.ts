import {createProduct,readProduct,updateProduct,deleteProduct,getProductsByCategory} from '../Controllers/productController'
import express from 'express'
const router = express.Router();
import authMiddleware from '../middleware/authMiddlewate'
import multer from "multer";
import isAdmin from '../middleware/admin';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); 
    }
  });
  
  const upload = multer({ storage });

router.post("/create", authMiddleware, isAdmin,upload.single("image"), createProduct); 

router.get('/',readProduct)

router.put('/update/:id',authMiddleware,updateProduct);

router.delete('/:id',authMiddleware,deleteProduct)

router.get("/category/:categoryName", getProductsByCategory);


export default router;
