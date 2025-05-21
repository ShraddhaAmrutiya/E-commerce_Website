import Review from "../Models/reviewModel";
import { Request, Response } from "express"; 
import { Product } from "../Models/productModel";

export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

 

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const review = new Review({
      product: id,
      user: req.user?.id,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ message: "Review added.", review });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ product: id }).populate("user", "name");

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
