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

/**
 * @swagger
 * /categories/add:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Books'
 *               description:
 *                 type: string
 *                 example: 'All kinds of books'
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request if required fields are missing
 *       500:
 *         description: Internal server error
 */
router.post('/add', authMiddleware, isAdmin, createCategory);

/**
 * @swagger
 * /categories/list:
 *   get:
 *     summary: Get a list of categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 */
router.get('/list', authMiddleware, getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Retrieve a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 */
router.get('/:id', authMiddleware, isAdmin,getCategoryById);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 */
router.put('/:id', authMiddleware, isAdmin, updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted.
 *       404:
 *         description: Category not found.
 */
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);

export default router;
