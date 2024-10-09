"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.readProduct = exports.createProduct = void 0;
const productModel_1 = require("../Models/productModel");
const createProduct = async (req, res) => {
    const { category, title, description, price, salePrice, discount, quantity, colors, } = req.body;
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
        const newProduct = new productModel_1.Product({
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
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.createProduct = createProduct;
const readProduct = async (req, res) => {
    try {
        const products = await productModel_1.Product.find().populate("category", "name");
        const groupedByCategory = {};
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
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching products", error });
    }
};
exports.readProduct = readProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { category, title, description, price, salePrice, discount, quantity, colors, } = req.body;
    try {
        const product = await productModel_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        if (category !== undefined)
            product.category = category;
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
