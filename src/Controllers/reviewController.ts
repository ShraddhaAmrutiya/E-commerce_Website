import Review from "../Models/reviewModel";
import { Request, Response } from "express";
import { Product } from "../Models/productModel";

export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: req.t("review.unauthorized") });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: req.t("review.productNotFound") });
    }

    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: req.t("review.alreadyReviewed") });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });
    await review.save();

    const reviews = await Review.find({ product: productId }).populate("user", "userName");

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    product.rating = parseFloat(averageRating.toFixed(1));
    await product.save();

    res.status(201).json({ message: req.t("review.reviewSuccess"), review });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ product: id }).populate("user", "userName");

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: req.t("review.noReviews") });
    }

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: req.t("review.errorFetching"), error: (error as Error).message });
  }
};

