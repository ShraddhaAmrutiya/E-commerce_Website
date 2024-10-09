"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productController_1 = require("../Controllers/productController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authMiddlewate_1 = __importDefault(require("../middleware/authMiddlewate"));
const multer_1 = __importDefault(require("multer"));
const admin_1 = __importDefault(require("../middleware/admin"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */
/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequestBody'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request if required fields are missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post("/create", authMiddlewate_1.default, admin_1.default, upload.single("image"), productController_1.createProduct);
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products grouped by category
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Products not found
 */
router.get('/', productController_1.readProduct);
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products grouped by category
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Products not found
 */
router.put('/update/:id', authMiddlewate_1.default, productController_1.updateProduct);
/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authMiddlewate_1.default, productController_1.deleteProduct);
exports.default = router;
