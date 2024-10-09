import { Product } from "../Models/productModel";
import express, { Request, Response } from "express";
import { Document } from 'mongoose';

export interface ProductRequestBody {
  category: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  discount?: number;
  quantity: number[];
  colors: string[];
}

export interface UpdateRequestBody {
  category?: string;
  title?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  discount?: number;
  quantity?: number[];
  colors?: string[];
}

export interface ICategory extends Document {
  name: string;
}


const createProduct = async (
  req: Request<{}, {}, ProductRequestBody>,
  res: Response
) => {
 
  const {
    category,
    title,
    description,
    price,
    salePrice,
    discount,
    quantity,
    colors,
  } = req.body;

  if (!category || !title || !description || !price || !quantity || !colors || colors.length === 0) {
    return res.status(400).json({ message: "All fields are required ." });
  }

  try {
    let finalSalePrice = salePrice !== undefined ? salePrice : price;
    let finalDiscount = discount !== undefined ? discount : 0;

    if (salePrice) {
      finalDiscount = Math.round(((price - salePrice) / price) * 100);
    }

    if (discount) {
      finalSalePrice = price - price * (discount / 100);
    }

    const newProduct = new Product({
      category,
      title,
      description,
      image: req.file?.path, 
      price,
      salePrice: finalSalePrice,
      discount: finalDiscount,
      quantity,
      colors,
    });

    await newProduct.save();
    return res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

const readProduct = async (req: Request, res: Response) => {
  
  try {
    const products = await Product.find().populate<{ category: ICategory }>("category", "name");

    const groupedByCategory: Record<string, any[]> = {};

    for (const product of products) {
      const categoryName = typeof product.category === 'string' ? "Uncategorized" : product.category.name;

      if (!groupedByCategory[categoryName]) {
        groupedByCategory[categoryName] = [];
      }

      groupedByCategory[categoryName].push({
        _id: product._id,
        title: product.title,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        discount: product.discount,
        quantity: product.quantity,
        colors: product.colors,
      });
    }

    const response = [];
    for (const category in groupedByCategory) {
      response.push({
        category,
        products: groupedByCategory[category],
      });
    }

    return res.json({
      message: "List of products grouped by category",
      categories: response,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

const updateProduct = async (
  req: Request<{ id: string }, {}, UpdateRequestBody>,
  res: Response
) => {
  const { id } = req.params;


  const {
    category,
    title,
    description,
    price,
    salePrice,
    discount,
    quantity,
    colors,
  } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (category !== undefined) product.category = category;
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (quantity !== undefined) product.quantity = quantity;
    if (colors !== undefined) product.colors = colors;

    if (price !== undefined) {
      product.price = price;

      if (salePrice !== undefined) {
        product.salePrice = salePrice;
        product.discount = Math.round(((price - salePrice) / price) * 100);
      } else if (discount !== undefined) {
        product.discount = discount;
        product.salePrice = price - price * (discount / 100);
      } else {
        product.salePrice = price;
        product.discount = 0;
      }
    } else if (salePrice !== undefined) {
      product.salePrice = salePrice;
      product.discount = Math.round(
        ((product.price - salePrice) / product.price) * 100
      );
    } else if (discount !== undefined) {
      product.discount = discount;
      product.salePrice = product.price - product.price * (discount / 100);
    }

    await product.save();
    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
 
  
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export { createProduct, readProduct, updateProduct, deleteProduct };
