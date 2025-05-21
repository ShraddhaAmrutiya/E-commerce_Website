import { Request, response, Response } from "express";
import Cart from "../Models/cartModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const getCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: req.t("cart.InvalidUserId") });
    }

    const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate("products.productId");

    if (!cart) {
      return res.status(200).json({ cartItems: [], cartCount: 0 });
    }

    const cartItems = cart.products;
    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

    return res.status(200).json({ cartItems, cartCount });
  } catch (error) {
    console.error(" Backend Error:", error);
    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};
export const updateCart = async (req: Request, res: Response) => {
  const { userId, productId, quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: req.t("cart.InvalidIds") });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: req.t("cart.InvalidQuantity") });
    }

    let cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!cart) {
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        products: [{ productId: new mongoose.Types.ObjectId(productId), quantity }],
      });
      await cart.save();
    } else {
      if (!Array.isArray(cart.products)) {
        cart.products = [];
      }

      const productObjectId = new mongoose.Types.ObjectId(productId);
      const productIndex = cart.products.findIndex((p) => p.productId.equals(productObjectId));

      if (productIndex >= 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.push({ productId: productObjectId, quantity });
      }

      await cart.save();
    }

    const updatedCart = await Cart.findOne({ userId: userId }).populate("products.productId");

    const cartItems = updatedCart?.products || [];

    return res.status(200).json({
      message: req.t("cart.Updated"),
      cartItems,
      cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let cart = await Cart.findOne({ userId: userObjectId }).populate({
      path: "products.productId",
      model: "Product",
      select: "title",
    });

    if (!cart) {
      return res.status(400).json({ message: req.t("cart.NotFound") });
    }

    const productToRemove = cart.products.find(
      (p) => p.productId && p.productId.equals(productObjectId)
    );

    if (!productToRemove) {
      return res.status(404).json({ message: req.t("cart.ProductNotFound") });
    }

    const removedProductName = (productToRemove.productId as any)?.title || "Unknown Product";

    // Filter out the product to remove and also any entries with null productId
    cart.products = cart.products.filter(
      (p) => p.productId && !p.productId.equals(productObjectId)
    );

    await cart.save();

    return res.status(200).json({
      message: req.t("cart.Removed", { name: removedProductName }),
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    await Cart.findOneAndDelete({ userId });

    return res.status(200).json({ message: req.t("cart.Cleared") });
  } catch (error: any) {
    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};

export const increaseQuantity = async (req: Request, res: Response) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) return res.status(400).json({ message: req.t("cart.MissingParams") });

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: req.t("cart.NotFound") });

    const item = cart.products.find((item) => item.productId.toString() === productId);

    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ message: req.t("cart.Increased"), cartItems: cart.products });
  } catch (error) {
    console.error("Increase error:", error);
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

export const decreaseQuantity = async (req: Request, res: Response) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) return res.status(400).json({ message: req.t("cart.MissingParams") });

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: req.t("cart.NotFound") });

    const item = cart.products.find((item) => item.productId.toString() === productId);

    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart.products = cart.products.filter((item) => item.productId.toString() !== productId);
      }

      await cart.save();
      res.status(200).json({ message: req.t("cart.Decreased"), cartItems: cart.products });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Decrease error:", error);
    return res.status(500).json({ message: req.t("auth.ServerError"), error: error.message });
  }
};
