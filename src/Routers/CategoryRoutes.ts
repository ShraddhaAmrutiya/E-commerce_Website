import express from "express";
import {
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory
} from '../Controllers/CategoryController';
import authMiddleware from '../middleware/authMiddlewate';
import isAdmin from '../middleware/admin';

const router = express.Router();

router.post('/add', authMiddleware, isAdmin, createCategory);


router.get('/list', authMiddleware, getCategories);


router.get('/:id', authMiddleware, isAdmin,getCategoryById);


router.put('/:id', authMiddleware, isAdmin, updateCategory);


router.delete('/:id', authMiddleware, isAdmin, deleteCategory);

export default router;
