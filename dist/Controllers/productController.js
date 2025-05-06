"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.getproductBYCategoryname = exports.getProductById = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.readProduct = exports.createProduct = void 0;
const productModel_1 = require("../Models/productModel");
const categoryModel_1 = require("../Models/categoryModel");
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const wishlistModel_1 = __importDefault(require("../Models/wishlistModel"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const createProduct = async (req, res) => {
    try {
        let { category, title, description, price, discountPercentage, stock, brand, rating, image } = req.body;
        price = Number(price);
        stock = Number(stock);
        rating = Number(rating);
        discountPercentage = Number(discountPercentage);
        if (!category || !title || isNaN(price)) {
            return res.status(400).json({ message: "Category, title, and valid price are required." });
        }
        const sellerId = req.user?.id;
        if (!sellerId) {
            return res.status(400).json({ message: "Seller is not authenticated." });
        }
        const categoryDoc = await categoryModel_1.Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ message: `Category '${category}' not found.` });
        }
        // --- Sale price logic same as frontend ---
        let finalDiscount = discountPercentage > 0 ? discountPercentage : 0;
        let finalSalePrice = price;
        if (finalDiscount > 0) {
            finalSalePrice = price - (price * finalDiscount) / 100;
        }
        // Ensure non-negative and round down to nearest integer
        finalSalePrice = Math.floor(Math.max(finalSalePrice, 0));
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : image || null;
        const newProduct = new productModel_1.Product({
            category: categoryDoc._id,
            title,
            description,
            price,
            image: imageUrl,
            salePrice: finalSalePrice,
            discountPercentage: finalDiscount,
            stock,
            brand,
            rating,
            seller: sellerId,
        });
        await newProduct.save();
        return res.status(201).json({
            message: "Product created successfully.",
            product: newProduct,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.createProduct = createProduct;
const readProduct = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const products = await productModel_1.Product.find()
            .populate("category", "name")
            .limit(limit)
            .exec();
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        const groupedByCategory = {};
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching products",
            error: error.message || "Unknown error",
        });
    }
};
exports.readProduct = readProduct;
const getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel_1.Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: `Category '${id}' not found.` });
        }
        const products = await productModel_1.Product.find({ category: category._id });
        return res.status(200).json({
            message: `Products in category: ${category.name}`,
            category: category.name,
            products,
        });
    }
    catch (error) {
        console.error("Error fetching products by category:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { categoryId, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } = req.body;
    try {
        const product = await productModel_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        const userId = req.user?.id;
        const userRole = req.user?.Role;
        if (product.seller.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
        }
        if (categoryId !== undefined) {
            const categoryDoc = (await categoryModel_1.Category.findById(categoryId));
            if (!categoryDoc) {
                return res.status(400).json({ message: `Category with ID '${categoryId}' not found.` });
            }
            product.category = categoryDoc._id;
        }
        if (title !== undefined)
            product.title = title;
        if (description !== undefined)
            product.description = description;
        if (stock !== undefined)
            product.stock = stock;
        if (brand !== undefined)
            product.brand = brand;
        if (rating !== undefined)
            product.rating = rating;
        if (price !== undefined && price !== "") {
            product.price = price;
            if (discountPercentage !== undefined && discountPercentage !== "") {
                product.discountPercentage = discountPercentage;
                product.salePrice = price - price * (discountPercentage / 100);
            }
            else if (salePrice !== undefined && salePrice !== "") {
                product.salePrice = salePrice;
                product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
            }
            else {
                product.salePrice = price;
                product.discountPercentage = 0;
            }
        }
        else if (salePrice !== undefined && salePrice !== "") {
            product.salePrice = salePrice;
            product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
        }
        else if (discountPercentage !== undefined && discountPercentage !== "") {
            product.discountPercentage = discountPercentage;
            product.salePrice = product.price - product.price * (discountPercentage / 100);
        }
        if (req.file) {
            if (product.image) {
                const oldImagePath = path_1.default.join(process.cwd(), product.image);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
            const imageUrl = `/uploads/${req.file.filename}`;
            product.image = imageUrl;
        }
        else if (typeof image === "string") {
            product.image = image;
        }
        await product.save();
        return res.status(200).json({
            message: "Product updated successfully.",
            product,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const { _id } = req.params;
    try {
        const product = await productModel_1.Product.findById(_id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.seller.toString() !== req.user.id && req.user.Role !== "admin") {
            return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
        }
        await cartModel_1.default.updateMany({}, { $pull: { items: { productId: _id } } });
        // Remove product from all wishlists
        const productIdToRemove = new mongoose_1.default.Types.ObjectId(_id);
        await wishlistModel_1.default.updateMany({ 'products.productId': productIdToRemove }, { $pull: { products: { productId: productIdToRemove } } });
        await product.deleteOne();
        if (product.image) {
            const imagePath = path_1.default.join(process.cwd(), product.image.startsWith("uploads/") ? product.image.slice(8) : product.image);
            fs_1.default.unlink(imagePath, (err) => {
                if (err)
                    console.error("Error deleting image:", err);
                else
                    console.log("Image deleted successfully.");
            });
        }
        return res.status(200).json({ message: "Product deleted." });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const getProductById = async (req, res) => {
    try {
        const { _id } = req.params;
        const userId = req.user?.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid product ID format." });
        }
        const product = await productModel_1.Product.findById(_id).populate("category", "name").populate("brand", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        let isInWishlist = false;
        if (userId) {
            const wishlistItem = await wishlistModel_1.default.findOne({ userId, productId: _id });
            if (wishlistItem) {
                isInWishlist = true;
            }
        }
        return res.status(200).json({
            message: "Product fetched successfully.",
            product,
            isInWishlist,
        });
    }
    catch (error) {
        console.error("Error fetching product by ID:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.getProductById = getProductById;
const getproductBYCategoryname = async (req, res) => {
    try {
        const categoryname = req.params.categoryname;
        const category = await categoryModel_1.Category.findOne({ name: categoryname });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const products = await productModel_1.Product.find({ category: category._id });
        if (!products.length) {
            return res.status(404).json({ message: "No products found" });
        }
        res.json({ products });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getproductBYCategoryname = getproductBYCategoryname;
const search = async (req, res) => {
    try {
        const query = req.query.q;
        const products = await productModel_1.Product.find({
            title: { $regex: query, $options: "i" },
        });
        res.json(products);
    }
    catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.search = search;
