"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = require("../Controllers/CategoryController");
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const admin_1 = __importDefault(require("../middleware/admin"));
const router = express_1.default.Router();
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
router.post('/add', authMiddlewate_1.default, admin_1.default, CategoryController_1.createCategory);
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
router.get('/list', authMiddlewate_1.default, CategoryController_1.getCategories);
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
router.get('/:id', authMiddlewate_1.default, admin_1.default, CategoryController_1.getCategoryById);
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
router.put('/:id', authMiddlewate_1.default, admin_1.default, CategoryController_1.updateCategory);
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
router.delete('/:id', authMiddlewate_1.default, admin_1.default, CategoryController_1.deleteCategory);
exports.default = router;
