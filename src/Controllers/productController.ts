// import { Product } from "../Models/productModel";
// import { Category } from "../Models/categoryModel";
// import express, { Request, Response } from "express";
// import mongoose, { Document, Types } from "mongoose";
// import path from "path";
// import fs from "fs";
// import { User } from "../Models/userModel";
// import Wishlist from "../Models/wishlistModel";
// import Cart from "../Models/cartModel";
// export interface ProductRequestBody {
//   category: string;
//   title: string;
//   description?: string;
//   price: number;
//   salePrice?: number;
//   image?: string;
//   rating: number;
//   brand?: string;
//   stock?: number;
//   discountPercentage?: number;
//   seller: string;
// }

// export interface UpdateRequestBody {
//   category?: string;
//   title?: string;
//   description?: string;
//   price?: number;
//   salePrice?: number;
//   discountPercentage?: number;
//   stock?: number[];
//   brand?: string[];
//   image?: string;
//   rating?: number;
// }
// interface AuthenticatedRequest extends Request {
//   id?: string;
//   user?: {
//     id: string;
//     Role: string;
//   };
// }

// export interface ICategory extends Document {
//   name: string;
// }
// const createProduct = async (req: Request, res: Response) => {
//   try {
//     const { category, title, description, price, discountPercentage, stock, brand, rating } = req.body;

//     const parsedPrice = Number(price);
//     const parsedStock = Number(stock);
//     const parsedRating = Number(rating);
//     const parsedDiscount = Number(discountPercentage);

//     if (!category || !title || isNaN(parsedPrice)) {
//       return res.status(400).json({ message: "Category, title, and valid price are required." });
//     }

//     const sellerId = req.user?.id;
//     if (!sellerId) {
//       return res.status(400).json({ message: "Seller is not authenticated." });
//     }

//     const categoryDoc = await Category.findOne({ name: category });
//     if (!categoryDoc) {
//       return res.status(400).json({ message: `Category '${category}' not found.` });
//     }

//     const finalSalePrice = Math.floor(
//       parsedDiscount > 0 ? parsedPrice - (parsedPrice * parsedDiscount) / 100 : parsedPrice
//     );

//     // Process multiple image paths
//     const imageUrls = req.files && Array.isArray(req.files)
//       ? req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`)
//       : [];

//     const newProduct = new Product({
//       category: categoryDoc._id,
//       title,
//       description,
//       price: parsedPrice,
//       image: imageUrls, // Save array of image URLs
//       salePrice: finalSalePrice,
//       discountPercentage: parsedDiscount,
//       stock: parsedStock,
//       brand,
//       rating: parsedRating,
//       seller: sellerId,
//     });

//     await newProduct.save();

//     return res.status(201).json({
//       message: "Product created successfully.",
//       product: newProduct,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

// const readProduct = async (req: Request, res: Response) => {
//   try {
//     const limit = parseInt(req.query.limit as string) || 10;

//     const products = await Product.find()
//       .populate<{ category: { name: string } }>("category", "name")
//       .limit(limit)
//       .exec();

//     if (!products || products.length === 0) {
//       return res.status(404).json({ message: "No products found" });
//     }

//     const groupedByCategory: Record<string, any[]> = {};

//     for (const product of products) {
//       const categoryName = product.category?.name ?? "Uncategorized";

//       if (!groupedByCategory[categoryName]) {
//         groupedByCategory[categoryName] = [];
//       }

//       groupedByCategory[categoryName].push({
//         _id: product._id,
//         title: product.title,
//         description: product.description,
//         price: product.price,
//         salePrice: product.salePrice,
//         discountPercentage: product.discountPercentage,
//         stock: product.stock,
//         brand: product.brand,
//         image: product.images,
//         rating: product.rating,
//       });
//     }

//     return res.json({
//       message: `List of ${limit} products grouped by category`,
//       categories: Object.entries(groupedByCategory).map(([category, products]) => ({
//         category,
//         products,
//       })),
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       message: "Error fetching products",
//       error: error.message || "Unknown error",
//     });
//   }
// };

// const getProductsByCategory = async (req: Request<{ id: string }>, res: Response) => {
//   try {
//     const { id } = req.params;

//     const category = await Category.findById(id);

//     if (!category) {
//       return res.status(404).json({ message: `Category '${id}' not found.` });
//     }

//     const products = await Product.find({ category: category._id });

//     return res.status(200).json({
//       message: `Products in category: ${category.name}`,
//       category: category.name,
//       products,
//     });
//   } catch (error) {
//     console.error("Error fetching products by category:", error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

// const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
//   const { id } = req.params;
//   const { categoryId, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } =
//     req.body;

//   try {
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found." });
//     }

//     const userId = req.user?.id;
//     const userRole = req.user?.Role;

//     if (product.seller.toString() !== userId && userRole !== "admin") {
//       return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
//     }

//     if (categoryId !== undefined) {
//       const categoryDoc = (await Category.findById(categoryId)) as { _id: Types.ObjectId } | null;

//       if (!categoryDoc) {
//         return res.status(400).json({ message: `Category with ID '${categoryId}' not found.` });
//       }
//       product.category = categoryDoc._id; 
//     }

//     if (title !== undefined) product.title = title;
//     if (description !== undefined) product.description = description;
//     if (stock !== undefined) product.stock = stock;
//     if (brand !== undefined) product.brand = brand;
//     if (rating !== undefined) product.rating = rating;

//     if (price !== undefined && price !== "") {
//       product.price = price;

//       if (discountPercentage !== undefined && discountPercentage !== "") {
//         product.discountPercentage = discountPercentage;
//         product.salePrice = price - price * (discountPercentage / 100);
//       }
//       else if (salePrice !== undefined && salePrice !== "") {
//         product.salePrice = salePrice;
//         product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
//       } else {
//         product.salePrice = price;
//         product.discountPercentage = 0;
//       }
//     }
//     else if (salePrice !== undefined && salePrice !== "") {
//       product.salePrice = salePrice;
//       product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
//     }
//     else if (discountPercentage !== undefined && discountPercentage !== "") {
//       product.discountPercentage = discountPercentage;
//       product.salePrice = product.price - product.price * (discountPercentage / 100);
//     }

//     if (req.file) {
//       if (product.images) {
//         const oldImagePath = path.join(process.cwd(), product.images);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath); 
//         }
//       }

//       const imageUrl = `/uploads/${req.file.filename}`;
//       product.images = imageUrl;
//     } else if (typeof image === "string") {
//       product.image = image;
//     }

//     await product.save();

//     return res.status(200).json({
//       message: "Product updated successfully.",
//       product,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

// const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
//   const { _id } = req.params;

//   try {
//     const product = await Product.findById(_id);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (product.seller.toString() !== req.user.id && req.user.Role !== "admin") {
//       return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
//     }
//     await Cart.updateMany({}, { $pull: { items: { productId: _id } } });

//     // Remove product from all wishlists
//     const productIdToRemove = new mongoose.Types.ObjectId(_id);

//     await Wishlist.updateMany(
//       { 'products.productId': productIdToRemove },
//       { $pull: { products: { productId: productIdToRemove } } }
//     );
    
//     await product.deleteOne();

//     if (product.image) {
//       const imagePath = path.join(
//         process.cwd(),
//         product.image.startsWith("uploads/") ? product.image.slice(8) : product.image
//       );
//       fs.unlink(imagePath, (err) => {
//         if (err) console.error("Error deleting image:", err);
//         else console.log("Image deleted successfully.");
//       });
//     }

//     return res.status(200).json({ message: "Product deleted." });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
// const getProductById = async (req: Request<{ _id: string }>, res: Response) => {
//   try {
//     const { _id } = req.params;
//     const userId = req.user?.id; 

//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       return res.status(400).json({ message: "Invalid product ID format." });
//     }

//     const product = await Product.findById(_id).populate("category", "name").populate("brand", "name");

//     if (!product) {
//       return res.status(404).json({ message: "Product not found." });
//     }

//     let isInWishlist = false;
//     if (userId) {
//       const wishlistItem = await Wishlist.findOne({ userId, productId: _id });

//       if (wishlistItem) {
//         isInWishlist = true;
//       }
//     }

//     return res.status(200).json({
//       message: "Product fetched successfully.",
//       product,
//       isInWishlist,
//     });
//   } catch (error) {
//     console.error("Error fetching product by ID:", error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

// const getproductBYCategoryname = async (req, res) => {
//   try {
//     const categoryname = req.params.categoryname;

//     const category = await Category.findOne({ name: categoryname });
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     const products = await Product.find({ category: category._id });

//     if (!products.length) {
//       return res.status(404).json({ message: "No products found" });
//     }

//     res.json({ products });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const search = async (req, res) => {
//   try {
//     const query = req.query.q;

//     const products = await Product.find({
//       title: { $regex: query, $options: "i" },
//     });

//     res.json(products);
//   } catch (err) {
//     console.error("Search error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export {
//   createProduct,
//   readProduct,
//   updateProduct,
//   deleteProduct,
//   getProductsByCategory,
//   getProductById,
//   getproductBYCategoryname,
//   search,
// };

import { Product } from "../Models/productModel";
import { Category } from "../Models/categoryModel";
import express, { Request, Response } from "express";
import mongoose, { Document, Types } from "mongoose";
import path from "path";
import fs from "fs";
import { User } from "../Models/userModel";
import Wishlist from "../Models/wishlistModel";
import Cart from "../Models/cartModel";

export interface ProductRequestBody {
  category: string;
  title: string;
  description?: string;
  price: number;
  salePrice?: number;
  images?: string[];
  rating: number;
  brand?: string;
  stock?: number;
  discountPercentage?: number;
  seller: string;
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
  images?: string[];
  rating?: number;
}

interface AuthenticatedRequest extends Request {
  id?: string;
  user?: {
    id: string;
    Role: string;
  };
}

export interface ICategory extends Document {
  name: string;
}

const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, title, description, price, discountPercentage, stock, brand, rating } = req.body;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = Number(rating);
    const parsedDiscount = Number(discountPercentage);

    if (!category || !title || isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Category, title, and valid price are required." });
    }

    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(400).json({ message: "Seller is not authenticated." });
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: `Category '${category}' not found.` });
    }

    const finalSalePrice = Math.floor(
      parsedDiscount > 0 ? parsedPrice - (parsedPrice * parsedDiscount) / 100 : parsedPrice
    );

    const imageUrls = req.files && 'image' in req.files
    ? (req.files['image'] as Express.Multer.File[]).map(file => `/uploads/${file.filename}`)
    : [];
  
    const newProduct = new Product({
      category: categoryDoc._id,
      title,
      description,
      price: parsedPrice,
      images: imageUrls,
      salePrice: finalSalePrice,
      discountPercentage: parsedDiscount,
      stock: parsedStock,
      brand,
      rating: parsedRating,
      seller: sellerId,
    });

    await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

const readProduct = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const products = await Product.find()
      .populate("category", "name")
      .limit(limit)
      .exec();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    const groupedByCategory: Record<string, any[]> = {};

    for (const product of products) {
      const categoryName = (product.category as any)?.name ?? "Uncategorized";

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
        images: product.images,
        rating: product.rating,
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

// ----------------- Update Product -----------------
const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { categoryId, title, description, price, salePrice, discountPercentage, stock, brand, rating } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const userId = req.user?.id;
    const userRole = req.user?.Role;

    if (product.seller.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
    }
    if (categoryId !== undefined) {
            const categoryDoc = (await Category.findById(categoryId)) as { _id: Types.ObjectId } | null;
      
            if (!categoryDoc) {
              return res.status(400).json({ message: `Category with ID '${categoryId}' not found.` });
            }
            product.category = categoryDoc._id; 
          }
    if (title) product.title = title;
    if (description) product.description = description;
    if (stock !== undefined) product.stock = stock;
    if (brand) product.brand = brand;
    if (rating !== undefined) product.rating = rating;

    if (price !== undefined) {
      product.price = price;
      if (discountPercentage !== undefined) {
        product.discountPercentage = discountPercentage;
        product.salePrice = price - price * (discountPercentage / 100);
      } else if (salePrice !== undefined) {
        product.salePrice = salePrice;
        product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
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

    // Update images
    if (req.files && Array.isArray(req.files)) {
      if (product.images && product.images.length > 0) {
        product.images.forEach((imgPath: string) => {
          const fullPath = path.join(process.cwd(), imgPath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
      }

      const newImagePaths = req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      product.images = newImagePaths;
    }

    await product.save();

    return res.status(200).json({ message: "Product updated successfully.", product });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// ----------------- Other Handlers (unchanged) -----------------
const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { _id } = req.params;

  try {
    const product = await Product.findById(_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user.id && req.user.Role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Cart.updateMany({}, { $pull: { items: { productId: _id } } });

    const productIdToRemove = new mongoose.Types.ObjectId(_id);
    await Wishlist.updateMany(
      { 'products.productId': productIdToRemove },
      { $pull: { products: { productId: productIdToRemove } } }
    );

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imgPath: string) => {
        const filePath = path.join(process.cwd(), imgPath.startsWith("uploads/") ? imgPath.slice(8) : imgPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await product.deleteOne();

    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const getProductsByCategory = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: `Category '${id}' not found.` });

    const products = await Product.find({ category: category._id });
    return res.status(200).json({ message: `Products in category: ${category.name}`, category: category.name, products });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const getProductById = async (req: Request<{ _id: string }>, res: Response) => {
  try {
    const { _id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }

    const product = await Product.findById(_id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found." });

    const wishlistItem = userId ? await Wishlist.findOne({ userId, productId: _id }) : null;
    const isInWishlist = !!wishlistItem;

    return res.status(200).json({ message: "Product fetched successfully.", product, isInWishlist });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const getproductBYCategoryname = async (req, res) => {
  try {
    const categoryname = req.params.categoryname;
    const category = await Category.findOne({ name: categoryname });

    if (!category) return res.status(404).json({ message: "Category not found" });

    const products = await Product.find({ category: category._id });
    if (!products.length) return res.status(404).json({ message: "No products found" });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const search = async (req, res) => {
  try {
    const query = req.query.q;
    const products = await Product.find({ title: { $regex: query, $options: "i" } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  createProduct,
  readProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductById,
  getproductBYCategoryname,
  search,
};
