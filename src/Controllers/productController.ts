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
  // rating?: number;
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

const DEFAULT_IMAGE = "/uploads/default-product-image.jpg";  

const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, title, description, price, discountPercentage, stock, brand, rating } = req.body;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = Number(rating);
    const parsedDiscount = Number(discountPercentage);

    if (!category || !title || isNaN(parsedPrice)) {
      return res.status(400).json({ message: req.t("product.missingFields") });
    }

    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(400).json({ message: req.t("auth.sellerNotAuthenticated") });
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: req.t("category.CategoryNotfound") });
    }

    // Calculate sale price
    const finalSalePrice = Math.floor(
      parsedDiscount > 0 ? parsedPrice - (parsedPrice * parsedDiscount) / 100 : parsedPrice
    );

    // Handle images
    let imageUrls: string[] = [];
    if (req.files && "images" in req.files) {
      imageUrls = (req.files["images"] as Express.Multer.File[]).map((file) => `/uploads/${file.filename}`);
    }

    // If no images provided, add default image
    if (imageUrls.length === 0) {
      imageUrls.push(DEFAULT_IMAGE);
    }

    // Create new product
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
      message: req.t("product.created"),
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

const readProduct = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) 

    const products = await Product.find().populate("category", "name").limit(limit).exec();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: req.t("product.notFound") });
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
      message: req.t("product.fetched"),
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

const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { categoryId, title, description, price, salePrice, discountPercentage, stock, brand } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: req.t("product.notFound") });

    const userId = req.user?.id;
    const userRole = req.user?.Role;

    if (product.seller.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: req.t("product.unauthorizedRole") });
    }
    if (categoryId !== undefined) {
      const categoryDoc = (await Category.findById(categoryId)) as { _id: Types.ObjectId } | null;

      if (!categoryDoc) {
        return res.status(400).json({ message: req.t("product.CategoryNotfound") });
      }
      product.category = categoryDoc._id;
    }
    if (title) product.title = title;
    if (description) product.description = description;
    if (stock !== undefined) product.stock = stock;
    if (brand) product.brand = brand;
    // if (rating !== undefined) product.rating = rating;

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

    await product.save();

    return res.status(200).json({ message: req.t("product.updated"), product });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { _id } = req.params;

  try {
    const product = await Product.findById(_id);
    if (!product) return res.status(404).json({ message: req.t("product.notFound") });

    if (product.seller.toString() !== req.user.id && req.user.Role !== "admin") {
      return res.status(403).json({ message: req.t("auth.unauthorized") });
    }

    await Cart.updateMany({}, { $pull: { items: { productId: _id } } });

    const productIdToRemove = new mongoose.Types.ObjectId(_id);
    await Wishlist.updateMany(
      { "products.productId": productIdToRemove },
      { $pull: { products: { productId: productIdToRemove } } }
    );

 if (product.images && Array.isArray(product.images)) {
  product.images.forEach((imgPath: string) => {
    const filename = path.basename(imgPath);
    if (filename !== "default-product-image.jpg") {
      const filePath = path.join(process.cwd(), imgPath.startsWith("uploads/") ? imgPath.slice(8) : imgPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
}


    await product.deleteOne();

    return res.status(200).json({ message: req.t("product.deleted") });
  } catch (error) {
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

const getProductsByCategory = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: req.t("category.CategoryNotfound") });

    const products = await Product.find({ category: category._id });
    return res
      .status(200)
      .json({ message: req.t("product.productsInCategory"), category: category.name, products });
  } catch (error) {
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};
const getProductById = async (req: Request<{ _id: string }>, res: Response) => {
  try {
    const { _id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message:req.t("product.invalidId") });
    }

    const product = await Product.findById(_id).populate("category", "name");
    if (!product) return res.status(404).json({ message:req.t("product.notFound") });

    const wishlistItem = userId ? await Wishlist.findOne({ userId, productId: _id }) : null;
    const isInWishlist = !!wishlistItem;

    return res.status(200).json({ message: req.t("product.fetched"), product, isInWishlist });
  } catch (error) {
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

const getproductBYCategoryname = async (req: Request, res: Response) => {
  try {
    const categoryname = req.params.categoryname;
    const category = await Category.findOne({ name: categoryname });

    if (!category) return res.status(404).json({ message: req.t("category.CategoryNotfound") });

    const products = await Product.find({ category: category._id });
    if (!products.length) return res.status(404).json({ message: req.t("product.notFound") });

    res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

const search = async (req: Request, res: Response) => {
  try {
    const query = req.query.q;
    const products = await Product.find({ title: { $regex: query, $options: "i" } });
    res.json(products);
  } catch (err) {
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

//  Replace a specific image
export const updateProductImage = async (req: AuthenticatedRequest, res: Response) => {
  const { productId, index } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ message: req.t("product.noImageUpload") });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: req.t("product.notFound") });

  const userId = req.user?.id;
  const userRole = req.user?.Role;
  if (product.seller.toString() !== userId && userRole !== "admin") {
    return res.status(403).json({ message: req.t("auth.Unauthorized") });
  }

  const i = parseInt(index);
  if (isNaN(i) || i < 0 || i >= product.images.length) {
    return res.status(400).json({ message: req.t("product.Invalidimageindex") });
  }

  const oldPath = path.join(process.cwd(), product.images[i]);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

  // Replace with new image
  product.images[i] = `/uploads/${file.filename}`;
  await product.save();

  res.status(200).json({ message: req.t("product.Imagereplacedsuccessfully"), images: product.images });
};

// Delete a specific image
export const deleteProductImage = async (req: AuthenticatedRequest, res: Response) => {
  const { productId, index } = req.params;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: req.t("product.notFound")});

  const userId = req.user?.id;
  const userRole = req.user?.Role;
  if (product.seller.toString() !== userId && userRole !== "admin") {
    return res.status(403).json({ message: req.t("auth.Unauthorized")  });
  }

  const i = parseInt(index);
  if (isNaN(i) || i < 0 || i >= product.images.length) {
    return res.status(400).json({ message: req.t("product.Invalidimageindex") });
  }

  const imgToDelete = product.images[i];
  const fullPath = path.join(process.cwd(), imgToDelete);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

  product.images.splice(i, 1);
  await product.save();

  res.status(200).json({ message: req.t("product.ImageDelete"), images: product.images });
};

//  Add new images
export const addProductImages = async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ message: req.t("product.noImageUpload") });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: req.t("product.notFound") });

  const userId = req.user?.id;
  const userRole = req.user?.Role;
  if (product.seller.toString() !== userId && userRole !== "admin") {
    return res.status(403).json({ message:req.t("auth.Unauthorized")});
  }

  const newImagePaths = files.map((file) => `/uploads/${file.filename}`);
  product.images.push(...newImagePaths);
  await product.save();

  res.status(200).json({ message: req.t("product.addImage"), images: product.images });
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
