
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

    // Fetch the wishlist for the user and populate the productId within the products array
    const wishlist = await Wishlist.find({ userId })
      .populate('products.productId', 'title price salePrice image')  // Populate productId inside the products array
      .exec();

    // If no wishlist items, return a message
    // if (wishlist.length === 0) {
    //   return res.status(404).json({ message: "No items found in the wishlist" });
    // }

    return res.status(200).json(wishlist); // Return the user's wishlist
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params; // Get the product ID from URL parameters
    const userId = req.headers["userid"] as string; // Get the user ID from headers
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    // Find the user's wishlist and remove the product from the products array
    const wishlist = await Wishlist.findOne({ userId });

    // If no wishlist found for the user, return an error
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found for user" });
    }

    // Find the product in the products array and remove it
    const productIndex = wishlist.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    // If product not found in wishlist
    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in the wishlist" });
    }

    // Remove the product from the products array
    wishlist.products.splice(productIndex, 1);

    // Save the updated wishlist
    await wishlist.save();

    return res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
