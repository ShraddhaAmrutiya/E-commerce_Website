import { Product } from "../Models/productModel";
import { Category } from "../Models/categoryModel";
import express, { Request, Response } from "express";
import mongoose, { Document, Types } from "mongoose";
import path from "path";
import fs from "fs"
export interface ProductRequestBody {
  category: string;
  title: string;
  description?: string;
  price: number;
  salePrice?: number;
  image?: string;
  rating: number;
  brand?: string;
  stock?: number;
  discountPercentage?: number;
}

export interface UpdateRequestBody {
  category?: string;
  title?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  discountPercentage?: number;
  stock?: number[];
  brand?: string[];
  image?: string;
  rating?: number;
}

export interface ICategory extends Document {
  name: string;
}
const createProduct = async (req: Request<{}, {}, ProductRequestBody>, res: Response) => {
  try {
    let { category, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } = req.body;

    if (!category || !title || !price) {
      return res.status(400).json({ message: "Category, title, and price are required." });
    }

    // Find category by name and get its ObjectId
    const categoryDoc = await Category.findOne({ name: category });

    if (!categoryDoc) {
      return res.status(400).json({ message: `Category '${category}' not found.` });
    }

    let finalSalePrice = salePrice !== undefined ? salePrice : price;
    let finalDiscount = discountPercentage !== undefined ? discountPercentage : 0;

    if (salePrice) {
      finalDiscount = Math.round(((price - salePrice) / price) * 100);
    }

    if (discountPercentage) {
      finalSalePrice = price - price * (discountPercentage / 100);
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : image || null;

    const newProduct = new Product({
      category: categoryDoc._id, // Store ObjectId instead of string
      title,
      description,
      price,
      image: imageUrl,
      salePrice: finalSalePrice,
      discountPercentage: finalDiscount,
      stock,
      brand,
      rating,
    });

    await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const readProduct = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10; // Default limit: 10

    // Fetch products with category populated
    const products = await Product.find()
      .populate<{ category: { name: string } }>("category", "name")
      .limit(limit) // Apply the limit
      .lean()
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    const groupedByCategory: Record<string, any[]> = {};

    for (const product of products) {
      const categoryName = product.category?.name ?? "Uncategorized";

      if (!groupedByCategory[categoryName]) {
        groupedByCategory[categoryName] = [];
      }

      groupedByCategory[categoryName].push({
        _id: product._id,
        title: product.title,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        brand: product.brand,
        image: product.image,
      });
    }

    return res.json({
      message: `List of ${limit} products grouped by category`,
      categories: Object.entries(groupedByCategory).map(([category, products]) => ({
        category,
        products,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching products",
      error: error.message || "Unknown error",
    });
  }
};


const getProductsByCategory = async (req: Request<{ categoryName: string }>, res: Response) => {
  try {
    const { categoryName } = req.params;

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ message: `Category '${categoryName}' not found.` });
    }

    const products = await Product.find({ category: category._id });

    return res.status(200).json({
      message: `Products in category: ${categoryName}`,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

const updateProduct = async (req: Request<{ id: string }, {}, ProductRequestBody>, res: Response) => {
  const { id } = req.params;
  const { category, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (category !== undefined) {
      const categoryDoc: { _id: Types.ObjectId; name: string } | null = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res.status(400).json({ message: `Category '${category}' not found.` });
      }
      product.category = categoryDoc._id;
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = stock;
    if (brand !== undefined) product.brand = brand;
    if (rating !== undefined) product.rating = rating;
    if (image !== undefined) product.image = image;

    if (price !== undefined) {
      product.price = price;
      if (salePrice !== undefined) {
        product.salePrice = salePrice;
        product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
      } else if (discountPercentage !== undefined) {
        product.discountPercentage = discountPercentage;
        product.salePrice = price - price * (discountPercentage / 100);
      } else {
        product.salePrice = price;
        product.discountPercentage = 0;
      }
    } else if (salePrice !== undefined) {
      product.salePrice = salePrice;
      product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
    } else if (discountPercentage !== undefined) {
      product.discountPercentage = discountPercentage;
      product.salePrice = product.price - product.price * (discountPercentage / 100);
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


// const deleteProduct = async (req: Request<{ _id: string }>, res: Response) => {
//   const { _id } = req.params;

//   try {
//     // Ensure _id is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       return res.status(400).json({ message: "Invalid product ID" });
//     }

//     const deleteProduct = await Product.findByIdAndDelete(_id);
//     if (!deleteProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (deleteProduct.image) {
//       const imagePath = path.join(__dirname, '..', 'uploads', deleteProduct.image); // Adjust path if needed
//       fs.unlink(imagePath, (err) => {
//         if (err) {
//           console.error("Error deleting image:", err);
//         } else {
//           console.log("Image deleted successfully.");
//         }
//       });
//     }

//     return res.status(200).json({ message: "Product deleted." });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

const deleteProduct = async (req: Request<{ _id: string }>, res: Response) => {
  const { _id } = req.params;

  try {
    const deleteProduct = await Product.findByIdAndDelete(_id);
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (deleteProduct.image) {

      const imagePath = path.join(process.cwd(), deleteProduct.image.startsWith('uploads/') ? deleteProduct.image.slice(8) : deleteProduct.image);
      

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted successfully.");
        }
      });
    }

    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};


const getProductById = async (req: Request<{ _id: string }>, res: Response) => {
  try {
    const { _id } = req.params;
    
    // Validate if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
  

    const product = await Product.findById(_id).populate("category", "name")
    .populate("brand", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({
      message: "Product fetched successfully.",
      product,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};


export { createProduct, readProduct, updateProduct, deleteProduct, getProductsByCategory,getProductById };
