"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const categoryModel_1 = require("../Models/categoryModel");
const productModel_1 = require("../Models/productModel");
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Category name is required." });
    }
    try {
        const newCategory = new categoryModel_1.Category({ name, description });
        await newCategory.save();
        return res.status(201).json({
            message: "Category created.",
            category: newCategory,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel_1.Category.find();
        return res.status(200).json(categories);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await categoryModel_1.Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        return res.status(200).json(category);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ message: "Name and description are required." });
    }
    try {
        console.log("Update payload:", { id, name, description });
        const updatedCategory = await categoryModel_1.Category.findByIdAndUpdate(id, { name, description }, { new: true, runValidators: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }
        return res.status(200).json({
            message: "Category updated.",
            category: updatedCategory,
        });
    }
    catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await categoryModel_1.Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        const products = await productModel_1.Product.find({ category: category._id });
        if (products.length > 0) {
            const deletedProducts = await productModel_1.Product.deleteMany({ category: category._id });
            if (deletedProducts.deletedCount === 0) {
                return res.status(404).json({ message: "No products found under this category." });
            }
        }
        const deletedCategory = await categoryModel_1.Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Failed to delete category." });
        }
        return res.status(200).json({
            message: "Category and associated products deleted successfully."
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.deleteCategory = deleteCategory;
