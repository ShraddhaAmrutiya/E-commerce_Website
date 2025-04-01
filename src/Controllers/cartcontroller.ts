import { Request, Response } from "express";
import Cart from "../Models/cartModel"
import {Product} from "../Models/productModel";
import {User} from "../Models/userModel";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()
// export const getCart = async (req: Request, res: Response) => {
//   try {
//     console.log("Received request for user ID:");
//     console.log("Request Headers:", req.headers);
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }

//     const token = authHeader.split(" ")[1]; // Extract token
//     console.log("Extracted Token:", token); // ✅ Debugging line

//     const { userId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID format" });
//     }

//     const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
//       .populate("products.productId");

//     if (!cart) {
//       return res.status(404).json({ message: "Cart is Empty" });
//     }

//     return res.status(200).json(cart);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };


export const getCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate("products.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart is Empty" });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Backend Error:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};



export const updateCart = async (req: Request, res: Response) => {
  const { userId, productId, quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId format" });
    }

    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        products: [{ productId: new mongoose.Types.ObjectId(productId), quantity }],
      });
      await cart.save();
      return res.status(201).json({ message: "New cart created with product", cart });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));

    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;
    } else {
      cart.products.push({ productId: productObjectId, quantity });
    }

    await cart.save();

    return res.status(200).json({ message: "Cart updated", cart });

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