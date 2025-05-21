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
    return res.status(400).json({ message: req.t("category.NameRequired") });
  }

  try {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res.status(409).json({ message: req.t("category.Exists") });
    }

    const newCategory = new Category({ name, description });
    await newCategory.save();

    return res.status(201).json({
      message: req.t("category.Created"),
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: req.t("auth.server.error"),
    });
  }
};

const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({
      message: req.t("auth.server.error"),
    });
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
      return res.status(404).json({ message: req.t("category.NotFound") });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({
      message: req.t("auth.server.error"),
    });
  }
};

const updateCategory = async (
  req: Request<{ id: string }, {}, CategoryRequestBody>,
  res: Response
) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: req.t("category.NameRequired") });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: req.t("category.NotFound") });
    }

    return res.status(200).json({
      message: req.t("category.Updated"),
      category: updatedCategory,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: req.t("auth.server.error"),
    });
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
      return res.status(404).json({ message: req.t("category.NotFound") });
    }

    const products = await Product.find({ category: category._id });

    if (products.length > 0) {
      const deletedProducts = await Product.deleteMany({
        category: category._id,
      });
      if (deletedProducts.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: req.t("category.NoProductsFound") });
      }
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res
        .status(404)
        .json({ message: req.t("category.DeleteFailed") });
    }

    return res.status(200).json({
      message: req.t("category.DeleteSuccess"),
    });
  } catch (error) {
    return res.status(500).json({
      message: req.t("auth.server.error"),
    });
  }
};



export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
