"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.readProduct = exports.createProduct = void 0;
const productModel_1 = require("../Models/productModel");
const categoryModel_1 = require("../Models/categoryModel");
const mongoose_1 = __importDefault(require("mongoose"));
const createProduct = async (req, res) => {
    try {
        let { category, title, description, price, salePrice, discount, quantity } = req.body;
        let colors = req.body.colors;
        // Convert `colors` to an array if it's a string
        if (typeof colors === "string") {
            colors = colors.split(",").map((color) => color.trim());
        }
        if (!category || !title || !description || !price || !quantity || !colors || colors.length === 0) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // 🔥 Find category by name and get its ObjectId
        const categoryDoc = await categoryModel_1.Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ message: `Category '${category}' not found.` });
        }
        let finalSalePrice = salePrice !== undefined ? salePrice : price;
        let finalDiscount = discount !== undefined ? discount : 0;
        if (salePrice) {
            finalDiscount = Math.round(((price - salePrice) / price) * 100);
        }
        if (discount) {
            finalSalePrice = price - price * (discount / 100);
        }
        const newProduct = new productModel_1.Product({
            category: categoryDoc._id, // ✅ Store ObjectId instead of string
            title,
            description,
            image: req.file?.path, // Handle image from multer
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
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.createProduct = createProduct;
const readProduct = async (req, res) => {
    try {
        // Fetch products with category populated
        const products = await productModel_1.Product.find()
            .populate("category", "name")
            .lean(); // Convert Mongoose docs to plain objects
        const groupedByCategory = {};
        for (const product of products) {
            // Ensure category is populated before accessing `name`
            const categoryName = product.category && "name" in product.category ? product.category.name : "Uncategorized";
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
        return res.json({
            message: "List of products grouped by category",
            categories: Object.entries(groupedByCategory).map(([category, products]) => ({
                category,
                products,
            })),
        });
    }
    catch (error) {
        console.error("Error in readProduct:", error);
        return res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};
exports.readProduct = readProduct;
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        // 🔍 Find category by name
        const category = await categoryModel_1.Category.findOne({ name: categoryName });
        if (!category) {
            return res.status(404).json({ message: `Category '${categoryName}' not found.` });
        }
        // 📦 Fetch products belonging to the found category
        const products = await productModel_1.Product.find({ category: category._id });
        return res.status(200).json({
            message: `Products in category: ${categoryName}`,
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
    const { category, title, description, price, salePrice, discount, quantity, colors } = req.body;
    try {
        const product = await productModel_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        if (category !== undefined) {
            if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ message: "Invalid category ID." });
            }
            product.category = new mongoose_1.default.Types.ObjectId(category); // ✅ Fix here!
        }
        if (title !== undefined)
            product.title = title;
        if (description !== undefined)
            product.description = description;
        if (quantity !== undefined)
            product.quantity = quantity;
        if (colors !== undefined)
            product.colors = colors;
        if (price !== undefined) {
            product.price = price;
            if (salePrice !== undefined) {
                product.salePrice = salePrice;
                product.discount = Math.round(((price - salePrice) / price) * 100);
            }
            else if (discount !== undefined) {
                product.discount = discount;
                product.salePrice = price - price * (discount / 100);
            }
            else {
                product.salePrice = price;
                product.discount = 0;
            }
        }
        else if (salePrice !== undefined) {
            product.salePrice = salePrice;
            product.discount = Math.round(((product.price - salePrice) / product.price) * 100);
        }
        else if (discount !== undefined) {
            product.discount = discount;
            product.salePrice = product.price - product.price * (discount / 100);
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
    const { id } = req.params;
    try {
        const deleteProduct = await productModel_1.Product.findByIdAndDelete(id);
        if (!deleteProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product deleted." });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
