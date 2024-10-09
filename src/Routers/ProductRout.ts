import {createProduct,readProduct,updateProduct,deleteProduct} from '../Controllers/productController'
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

router.post("/create", authMiddleware, isAdmin,upload.single("image"), createProduct); 

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
router.get('/',readProduct)


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
router.put('/update/:id',authMiddleware,updateProduct);


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
router.delete('/:id',authMiddleware,deleteProduct)

export default router;
