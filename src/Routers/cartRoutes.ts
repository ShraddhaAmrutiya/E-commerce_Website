import express from "express";
import { getCart, updateCart, removeFromCart, clearCart,increaseQuantity ,decreaseQuantity} from "../Controllers/cartcontroller";
import authMiddleware from '../middleware/authMiddlewate';
import Cart from "../Models/cartModel";
import checkRole from '../middleware/admin';

const router = express.Router();

router.get("/:userId", authMiddleware,getCart);

router.put("/", authMiddleware, updateCart);

router.delete("/",authMiddleware,removeFromCart);

router.delete("/:userId",authMiddleware,clearCart);
router.put('/increase', authMiddleware, increaseQuantity);
router.put('/decrease', authMiddleware, decreaseQuantity);
router.get('/count/:userId',async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.json({ count: 0 });
    
    // Get the number of products in the cart (length of the products array)
    const totalCount = cart.products.length;
  console.log("cart productes",cart.products);
  
    return res.json({ count: totalCount });
  });
  
export default router;
