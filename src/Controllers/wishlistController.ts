
import { Request, Response } from "express";
import Wishlist from "../Models/wishlistModel";
import { Product } from "../Models/productModel";

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userid"] as string;
    if (!userId) {
      return res.status(400).json({ message: "Bad Request: User ID missing" });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [{ productId, quantity: 1 }],
      });
    } else {
      const existingItem = wishlist.products.find((item) => item.productId.equals(productId));
      if (existingItem) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }
      wishlist.products.push({ productId, quantity: 1 });
    }

    await wishlist.save();

    return res.status(201).json({ message: "Added to wishlist", wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};


export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const wishlist = await Wishlist.find({ userId })
      .populate('products.productId', 'title price salePrice images')  
      .exec();

   

    return res.status(200).json(wishlist); 
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params; 
    const userId = req.headers["userid"] as string; 
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found for user" });
    }

    const productIndex = wishlist.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in the wishlist" });
    }

    wishlist.products.splice(productIndex, 1);

    await wishlist.save();

    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
