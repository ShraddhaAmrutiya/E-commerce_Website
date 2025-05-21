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
        const { id } = req.params;
        const product = await productModel_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        const review = new reviewModel_1.default({
            product: id,
            user: req.user?.id,
            rating,
            comment,
        });
        await review.save();
        res.status(201).json({ message: "Review added.", review });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addReview = addReview;
const getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await reviewModel_1.default.find({ product: id }).populate("user", "name");
        res.status(200).json({ reviews });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getReviews = getReviews;
