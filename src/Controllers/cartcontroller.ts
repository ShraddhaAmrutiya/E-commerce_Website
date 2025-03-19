import { Request, Response } from "express";
import Cart from "../Models/cartModel"
import {Product} from "../Models/productModel";
import {User} from "../Models/userModel";
import mongoose from "mongoose";




export const getCart = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const cart = await Cart.findOne({ userId }).populate("products.productId"); 
      if (!cart) {
        return res.status(404).json({ message: "Cart is Empty" });
      }
      return res.status(200).json(cart);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };
  export const updateCart = async (req: Request, res: Response) => {
    const { userId, productId, quantity } = req.body;

    try {
        
        let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (!cart) {
            cart = new Cart({
                userId: new mongoose.Types.ObjectId(userId),
                products: [{ productId: new mongoose.Types.ObjectId(productId), quantity }]
            });
            await cart.save();
            return res.status(201).json({ message: "New cart created with product", cart });
        }


        const productObjectId = new mongoose.Types.ObjectId(productId);
        const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));

        if (productIndex >= 0) {
            // 🔹 Update quantity if product exists
            cart.products[productIndex].quantity = quantity;
        } else {
            // 🔹 Add product if it doesn't exist in cart
            cart.products.push({ productId: productObjectId, quantity });
        }

        await cart.save();

        return res.status(200).json({
            message: "Cart updated",
            cart
        });

    } catch (error) {
        console.error("Error updating cart:", error);
        return res.status(500).json({ error: (error as Error).message });
    }
};


export const removeFromCart = async (req: Request, res: Response) => {
  try {
      const { userId, productId } = req.body;

     
      const productObjectId = new mongoose.Types.ObjectId(productId);
      const userObjectId = new mongoose.Types.ObjectId(userId);

      let cart = await Cart.findOne({ userId: userObjectId })
      .populate({
          path: "products.productId",
          model: "Product", // Ensure it explicitly refers to the Product model
          select: "title"
      });
      if (!cart) {
          return res.status(400).json({ message: "Cart not found" });
      }


      const productToRemove = cart.products.find((p) => p.productId.equals(productObjectId));

      if (!productToRemove) {
          return res.status(404).json({ message: "Product not found in cart" });
      }


      // Get product name correctly
      const removedProductName = (productToRemove.productId as any)?.title || "Unknown Product";

      cart.products = cart.products.filter((p) => !p.productId.equals(productObjectId));
      await cart.save();

      return res.status(200).json({
          message: ` ${removedProductName} removed from cart`,
          
      });

  } catch (error) {
      console.error("Error removing product from cart:", error);
      return res.status(500).json({ error: (error as Error).message });
  }
};


export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};