// import { Request, Response } from "express";
// import Wishlist from "../Models/wishlistModel";
// import {Product} from "../Models/productModel";


// export const addToWishlist = async (req: Request, res: Response) => {
//     try {
//       const userId = req.headers["userId"] || req.headers["userid"]; // Extract userId from headers
  
//       if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });
  
//       const { productId } = req.body;
  
//       const product = await Product.findById(productId);
//       if (!product) return res.status(404).json({ message: "Product not found" });
  
//       const existingWishlistItem = await Wishlist.findOne({ userId, productId });
//       if (existingWishlistItem) return res.status(400).json({ message: "Product already in wishlist" });
  
//       const wishlistItem = new Wishlist({ userId, productId });
//       await wishlistItem.save();
  
//       return res.status(201).json({ message: "Added to wishlist", wishlistItem });
//     } catch (error) {
//       return res.status(500).json({ error: (error as Error).message });
//     }
//   };
  

// export const getWishlist = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;  
//     if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

//     // Fetch wishlist items with product details
//     const wishlist = await Wishlist.find({ userId }).populate("productId");

//     return res.status(200).json(wishlist);
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

// export const removeFromWishlist = async (req: Request, res: Response) => {
//   try {
//     const { productId } = req.params;
//     const userId = req.headers["userId"] || req.headers["userid"];
//     if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

//     if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

//     const deletedItem = await Wishlist.findOneAndDelete({ userId, productId });

//     if (!deletedItem) return res.status(404).json({ message: "Product not in wishlist" });

//     return res.status(200).json({ message: "Product removed from wishlist" });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

import { Request, Response } from "express";
import Wishlist from "../Models/wishlistModel";
import { Product } from "../Models/productModel";

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    // Standardize the header name (always use "userId")
    const userId = req.headers["userid"] as string;
    if (!userId) {
      return res.status(400).json({ message: "Bad Request: User ID missing" });
    }

    const { productId } = req.body;
    if (!productId) { 
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if the product exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already in the user's wishlist
    const existingWishlistItem = await Wishlist.findOne({ userId, productId });
    if (existingWishlistItem) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add the product to the wishlist
    const wishlistItem = new Wishlist({ userId, productId });
    await wishlistItem.save();

    return res.status(201).json({ message: "Added to wishlist", wishlistItem });
  } catch (error) {
    // Log the error for better debugging
    console.error("Error adding to wishlist:", error);

    return res.status(500).json({ error: (error as Error).message });
  }
};


export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

    const wishlist = await Wishlist.find({ userId }).populate("productId", "title price image");

    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};


export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.headers["userId"] || req.headers["userid"];
    if (!userId) return res.status(401).json({ message: "Unauthorized: User ID missing" });

    const deletedItem = await Wishlist.findOneAndDelete({ userId, productId });

    if (!deletedItem) return res.status(404).json({ message: "Product not in wishlist" });

    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};
