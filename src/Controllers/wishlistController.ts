
import { Request, Response } from "express";
import Wishlist from "../Models/wishlistModel";
import { Product } from "../Models/productModel";

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["userid"] as string;
    if (!userId) {
      return res.status(400).json({ message: req.t("wishlist.UserIdMissing") });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: req.t("wishlist.ProductIdRequired") });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: req.t("wishlist.ProductNotFound") });
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
        return res.status(400).json({ message: req.t("wishlist.AlreadyInWishlist") });
      }
      wishlist.products.push({ productId, quantity: 1 });
    }

    await wishlist.save();

    return res.status(201).json({ message: req.t("wishlist.AddedSuccess"), wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ message: req.t("wishlist.InternalError") });
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: req.t("wishlist.UserIdRequired") });
    }

    const wishlist = await Wishlist.find({ userId })
      .populate('products.productId', 'title price salePrice images')
      .exec();

    return res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: req.t("wishlist.InternalError") });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.headers["userid"] as string;

    if (!userId) {
      return res.status(401).json({ message: req.t("wishlist.UserIdMissing") });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: req.t("wishlist.WishlistNotFound") });
    }

    const productIndex = wishlist.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: req.t("wishlist.ProductNotInWishlist") });
    }

    wishlist.products.splice(productIndex, 1);

    await wishlist.save();

    return res.status(200).json({ message: req.t("wishlist.RemovedSuccess") });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ message: req.t("wishlist.InternalError") });
  }
};

