"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = exports.addReview = void 0;
const reviewModel_1 = __importDefault(require("../Models/reviewModel"));
const productModel_1 = require("../Models/productModel");
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { id: productId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: req.t("review.unauthorized") });
        }
        const product = await productModel_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: req.t("review.productNotFound") });
        }
        const existingReview = await reviewModel_1.default.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: req.t("review.alreadyReviewed") });
        }
        const review = new reviewModel_1.default({
            product: productId,
            user: userId,
            rating,
            comment,
        });
        await review.save();
        const reviews = await reviewModel_1.default.find({ product: productId }).populate("user", "userName");
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        product.rating = parseFloat(averageRating.toFixed(1));
        await product.save();
        res.status(201).json({ message: req.t("review.reviewSuccess"), review });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addReview = addReview;
const getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await reviewModel_1.default.find({ product: id }).populate("user", "userName");
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: req.t("review.noReviews") });
        }
        res.status(200).json({ reviews });
    }
    catch (error) {
        res.status(500).json({ message: req.t("review.errorFetching"), error: error.message });
    }
};
exports.getReviews = getReviews;
