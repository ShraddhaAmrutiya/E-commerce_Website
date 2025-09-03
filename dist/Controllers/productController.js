"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.getproductBYCategoryname = exports.getProductById = exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.readProduct = exports.createProduct = exports.addProductImages = exports.deleteProductImage = exports.updateProductImage = void 0;
const productModel_1 = require("../Models/productModel");
const categoryModel_1 = require("../Models/categoryModel");
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const wishlistModel_1 = __importDefault(require("../Models/wishlistModel"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const DEFAULT_IMAGE = "/uploads/default-product-image.jpg";
const createProduct = async (req, res) => {
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
        const categoryDoc = await categoryModel_1.Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ message: req.t("category.CategoryNotfound") });
        }
        // Calculate sale price
        const finalSalePrice = Math.floor(parsedDiscount > 0 ? parsedPrice - (parsedPrice * parsedDiscount) / 100 : parsedPrice);
        // Handle images
        let imageUrls = [];
        if (req.files && "images" in req.files) {
            imageUrls = req.files["images"].map((file) => `/uploads/${file.filename}`);
        }
        // If no images provided, add default image
        if (imageUrls.length === 0) {
            imageUrls.push(DEFAULT_IMAGE);
        }
        // Create new product
        const newProduct = new productModel_1.Product({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
exports.createProduct = createProduct;
const readProduct = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const products = await productModel_1.Product.find().populate("category", "name").limit(limit).exec();
        if (!products || products.length === 0) {
            return res.status(404).json({ message: req.t("product.notFound") });
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching products",
            error: error.message || "Unknown error",
        });
    }
};
exports.readProduct = readProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { categoryId, title, description, price, salePrice, discountPercentage, stock, brand } = req.body;
    try {
        const product = await productModel_1.Product.findById(id);
        if (!product)
            return res.status(404).json({ message: req.t("product.notFound") });
        const userId = req.user?.id;
        const userRole = req.user?.Role;
        if (product.seller.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({ message: req.t("product.unauthorizedRole") });
        }
        if (categoryId !== undefined) {
            const categoryDoc = (await categoryModel_1.Category.findById(categoryId));
            if (!categoryDoc) {
                return res.status(400).json({ message: req.t("product.CategoryNotfound") });
            }
            product.category = categoryDoc._id;
        }
        if (title)
            product.title = title;
        if (description)
            product.description = description;
        if (stock !== undefined)
            product.stock = stock;
        if (brand)
            product.brand = brand;
        // if (rating !== undefined) product.rating = rating;
        if (price !== undefined) {
            product.price = price;
            if (discountPercentage !== undefined) {
                product.discountPercentage = discountPercentage;
                product.salePrice = price - price * (discountPercentage / 100);
            }
            else if (salePrice !== undefined) {
                product.salePrice = salePrice;
                product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
            }
            else {
                product.salePrice = price;
                product.discountPercentage = 0;
            }
        }
        else if (salePrice !== undefined) {
            product.salePrice = salePrice;
            product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
        }
        else if (discountPercentage !== undefined) {
            product.discountPercentage = discountPercentage;
            product.salePrice = product.price - product.price * (discountPercentage / 100);
        }
        await product.save();
        return res.status(200).json({ message: req.t("product.updated"), product });
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
        if (!product)
            return res.status(404).json({ message: req.t("product.notFound") });
        if (product.seller.toString() !== req.user.id && req.user.Role !== "admin") {
            return res.status(403).json({ message: req.t("auth.unauthorized") });
        }
        await cartModel_1.default.updateMany({}, { $pull: { items: { productId: _id } } });
        const productIdToRemove = new mongoose_1.default.Types.ObjectId(_id);
        await wishlistModel_1.default.updateMany({ "products.productId": productIdToRemove }, { $pull: { products: { productId: productIdToRemove } } });
        if (product.images && Array.isArray(product.images)) {
            product.images.forEach((imgPath) => {
                const filename = path_1.default.basename(imgPath);
                if (filename !== "default-product-image.jpg") {
                    const filePath = path_1.default.join(process.cwd(), imgPath.startsWith("uploads/") ? imgPath.slice(8) : imgPath);
                    if (fs_1.default.existsSync(filePath))
                        fs_1.default.unlinkSync(filePath);
                }
            });
        }
        await product.deleteOne();
        return res.status(200).json({ message: req.t("product.deleted") });
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.deleteProduct = deleteProduct;
const getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel_1.Category.findById(id);
        if (!category)
            return res.status(404).json({ message: req.t("category.CategoryNotfound") });
        const products = await productModel_1.Product.find({ category: category._id });
        return res
            .status(200)
            .json({ message: req.t("product.productsInCategory"), category: category.name, products });
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const getProductById = async (req, res) => {
    try {
        const { _id } = req.params;
        const userId = req.user?.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: req.t("product.invalidId") });
        }
        const product = await productModel_1.Product.findById(_id).populate("category", "name");
        if (!product)
            return res.status(404).json({ message: req.t("product.notFound") });
        const wishlistItem = userId ? await wishlistModel_1.default.findOne({ userId, productId: _id }) : null;
        const isInWishlist = !!wishlistItem;
        return res.status(200).json({ message: req.t("product.fetched"), product, isInWishlist });
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getProductById = getProductById;
const getproductBYCategoryname = async (req, res) => {
    try {
        const categoryname = req.params.categoryname;
        const category = await categoryModel_1.Category.findOne({ name: categoryname });
        if (!category)
            return res.status(404).json({ message: req.t("category.CategoryNotfound") });
        const products = await productModel_1.Product.find({ category: category._id });
        if (!products.length)
            return res.status(404).json({ message: req.t("product.notFound") });
        res.json({ products });
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getproductBYCategoryname = getproductBYCategoryname;
const search = async (req, res) => {
    try {
        const query = req.query.q;
        const products = await productModel_1.Product.find({ title: { $regex: query, $options: "i" } });
        res.json(products);
    }
    catch (err) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.search = search;
//  Replace a specific image
const updateProductImage = async (req, res) => {
    const { productId, index } = req.params;
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: req.t("product.noImageUpload") });
    const product = await productModel_1.Product.findById(productId);
    if (!product)
        return res.status(404).json({ message: req.t("product.notFound") });
    const userId = req.user?.id;
    const userRole = req.user?.Role;
    if (product.seller.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({ message: req.t("auth.Unauthorized") });
    }
    const i = parseInt(index);
    if (isNaN(i) || i < 0 || i >= product.images.length) {
        return res.status(400).json({ message: req.t("product.Invalidimageindex") });
    }
    const oldPath = path_1.default.join(process.cwd(), product.images[i]);
    if (fs_1.default.existsSync(oldPath))
        fs_1.default.unlinkSync(oldPath);
    // Replace with new image
    product.images[i] = `/uploads/${file.filename}`;
    await product.save();
    res.status(200).json({ message: req.t("product.Imagereplacedsuccessfully"), images: product.images });
};
exports.updateProductImage = updateProductImage;
// Delete a specific image
const deleteProductImage = async (req, res) => {
    const { productId, index } = req.params;
    const product = await productModel_1.Product.findById(productId);
    if (!product)
        return res.status(404).json({ message: req.t("product.notFound") });
    const userId = req.user?.id;
    const userRole = req.user?.Role;
    if (product.seller.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({ message: req.t("auth.Unauthorized") });
    }
    const i = parseInt(index);
    if (isNaN(i) || i < 0 || i >= product.images.length) {
        return res.status(400).json({ message: req.t("product.Invalidimageindex") });
    }
    const imgToDelete = product.images[i];
    const fullPath = path_1.default.join(process.cwd(), imgToDelete);
    if (fs_1.default.existsSync(fullPath))
        fs_1.default.unlinkSync(fullPath);
    product.images.splice(i, 1);
    await product.save();
    res.status(200).json({ message: req.t("product.ImageDelete"), images: product.images });
};
exports.deleteProductImage = deleteProductImage;
//  Add new images
const addProductImages = async (req, res) => {
    const { productId } = req.params;
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ message: req.t("product.noImageUpload") });
    }
    const product = await productModel_1.Product.findById(productId);
    if (!product)
        return res.status(404).json({ message: req.t("product.notFound") });
    const userId = req.user?.id;
    const userRole = req.user?.Role;
    if (product.seller.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({ message: req.t("auth.Unauthorized") });
    }
    const newImagePaths = files.map((file) => `/uploads/${file.filename}`);
    product.images.push(...newImagePaths);
    await product.save();
    res.status(200).json({ message: req.t("product.addImage"), images: product.images });
};
exports.addProductImages = addProductImages;
