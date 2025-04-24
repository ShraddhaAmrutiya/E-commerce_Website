import { Category } from "../Models/categoryModel";
import express, { Request, Response } from "express";
import { Product } from "../Models/productModel";
export interface CategoryRequestBody {
  name: string;
  description?: string;
}

const createCategory = async (
  req: Request<{}, {}, CategoryRequestBody>,
  res: Response
) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists." });
    }
    const newCategory = new Category({ name, description });
    await newCategory.save();
    return res.status(201).json({
      message: "Category created.",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const getCategoryById = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};



 const updateCategory = async (
  req: Request<{ id: string }, {}, CategoryRequestBody>,
  res: Response
) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name ) {
    return res.status(400).json({ message: "Name is rquired." });
  }

  try {

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json({
      message: "Category updated.",
      category: updatedCategory,
    });
  } catch (error: any) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



const deleteCategory = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const products = await Product.find({ category: category._id });

    if (products.length > 0) {
      const deletedProducts = await Product.deleteMany({ category: category._id });
      if (deletedProducts.deletedCount === 0) {
        return res.status(404).json({ message: "No products found under this category." });
      }
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Failed to delete category." });
    }

    return res.status(200).json({
      message: "Category and associated products deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};


export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
