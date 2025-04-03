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
import isAdmin from '../middleware/admin';

const router = express.Router();

router.post('/add', createCategory);


router.get('/list', getCategories);


router.get('/:id',getCategoryById);


router.put('/:id',  updateCategory);


router.delete('/:id', deleteCategory);

router.get('/products/:id', getProductsByCategory);


export default router;
