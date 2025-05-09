import express from "express";
import {
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory
} from '../Controllers/CategoryController';
import { getProductsByCategory} from '../Controllers/productController';

import authMiddleware from '../middleware/authMiddlewate';
import checkRole from '../middleware/admin';

const router = express.Router();

router.post('/add',authMiddleware, checkRole(["admin"]), createCategory);


router.get('/list', getCategories);


router.get('/:id',getCategoryById);


router.put('/update/:id', authMiddleware,checkRole(["admin"]) ,updateCategory);


router.delete('/delete/:id',authMiddleware,checkRole(["admin"]), deleteCategory);

router.get('/products/:id', getProductsByCategory);


export default router;
