import { Category } from "../Models/categoryModel";
import express, { Request, Response } from "express";

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
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const deleteCategory = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({ message: "Category deleted." });
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
