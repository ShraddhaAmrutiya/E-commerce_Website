import { Request, Response } from "express";
import Wishlist from "../Models/wishlistModel";
import {Product} from "../Models/productModel";


// ✅ Add product to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
    try {
      const userId = req.headers["userId"] || req.headers["userid"]; // Extract userId from headers
  
      if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });
  
      const { productId } = req.body;
  
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
  
      // Check if already in wishlist
      const existingWishlistItem = await Wishlist.findOne({ userId, productId });
      if (existingWishlistItem) return res.status(400).json({ message: "Product already in wishlist" });
  
      // Add to wishlist
      const wishlistItem = new Wishlist({ userId, productId });
      await wishlistItem.save();
  
      return res.status(201).json({ message: "Added to wishlist", wishlistItem });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };
  

// ✅ Get user's wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;  
    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

    // Fetch wishlist items with product details
    const wishlist = await Wishlist.find({ userId }).populate("productId");

    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Remove product from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.headers["userId"] || req.headers["userid"];
    console.log("Extracted userId:", userId);
    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });
        console.log("Received userId:", userId);

    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

    const deletedItem = await Wishlist.findOneAndDelete({ userId, productId });

    if (!deletedItem) return res.status(404).json({ message: "Product not in wishlist" });

    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};
