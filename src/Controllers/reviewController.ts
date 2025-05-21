import Review from "../Models/reviewModel";
import { Request, Response } from "express";
import { Product } from "../Models/productModel";



export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const review = new Review({
      product: productId,
      user: req.user?.id,
      rating,
      comment,
    });
    await review.save();

const reviews = await Review.find({ product: productId }).populate("user", "userName");

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    product.rating = parseFloat(averageRating.toFixed(1));
    await product.save();

    res.status(201).json({ message: "Review added and rating updated.", review });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ product: id }).populate("user", "userName");

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
