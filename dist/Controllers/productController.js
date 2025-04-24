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
// const createProduct = async (req: Request<{}, {}, ProductRequestBody>, res: Response) => {
//   try {
//     let {
//       category,
//       title,
//       description,
//       price,
//       salePrice: inputSalePrice, // renamed to avoid conflict
//       discountPercentage,
//       stock,
//       brand,
//       rating,
//       image,
//     } = req.body;
//     // Cast all numeric fields
//     price = Number(price);
//     stock = Number(stock);
//     rating = Number(rating);
//     discountPercentage = Number(discountPercentage);
//     const parsedSalePrice = inputSalePrice !== undefined ? Number(inputSalePrice) : undefined;
//     if (!category || !title || isNaN(price)) {
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
//     // Calculate finalSalePrice
//     let finalSalePrice = price;
//     let finalDiscount = 0;
//     if (!isNaN(discountPercentage) && discountPercentage > 0) {
//       finalSalePrice = price - (price * discountPercentage) / 100;
//       finalDiscount = discountPercentage;
//     } else if (!isNaN(parsedSalePrice)) {
//       finalSalePrice = parsedSalePrice;
//       finalDiscount = Math.round(((price - parsedSalePrice) / price) * 100);
//     }
//     finalSalePrice = Math.floor(Number(finalSalePrice)); // Explicitly cast to number
//     const imageUrl = req.file ? `/uploads/${req.file.filename}` : image || null;
//     const newProduct = new Product({
//       category: categoryDoc._id,
//       title,
//       description,
//       price,
//       image: imageUrl,
//       salePrice: finalSalePrice,
//       discountPercentage: finalDiscount,
//       stock,
//       brand,
//       rating,
//       seller: sellerId,
//     });
//     await newProduct.save();
//     return res.status(201).json({
//       message: "Product created successfully.",
//       product: newProduct,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
const createProduct = async (req, res) => {
    try {
        let { category, title, description, price, salePrice: inputSalePrice, // renamed to avoid conflict
        discountPercentage, stock, brand, rating, image, } = req.body;
        // Cast all numeric fields
        price = Number(price);
        stock = Number(stock);
        rating = Number(rating);
        discountPercentage = Number(discountPercentage);
        const parsedSalePrice = inputSalePrice !== undefined ? Number(inputSalePrice) : undefined;
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
        // Calculate finalSalePrice
        let finalSalePrice = price; // Default is price
        let finalDiscount = 0;
        // If the discountPercentage is 0, set salePrice equal to price
        if (discountPercentage === 0) {
            finalSalePrice = price;
            finalDiscount = 0;
        }
        else if (discountPercentage > 0) {
            // If discountPercentage is greater than 0, calculate salePrice
            finalSalePrice = price - (price * discountPercentage) / 100;
            finalDiscount = discountPercentage;
        }
        else if (parsedSalePrice && !isNaN(parsedSalePrice)) {
            // If a salePrice is provided directly, use it
            finalSalePrice = parsedSalePrice;
            finalDiscount = Math.round(((price - parsedSalePrice) / price) * 100);
        }
        // Make sure salePrice is not negative
        finalSalePrice = Math.max(finalSalePrice, 0);
        // Explicitly cast to number (if required)
        finalSalePrice = Math.floor(Number(finalSalePrice));
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : image || null;
        // Create new product
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
        // Save the new product to the database
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
                rating: product.rating
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
// const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
//   const { id } = req.params;
//   const { category, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } = req.body;
//   try {
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found." });
//     }
//     // Check if the user is the seller or an admin
//     if (product.seller.toString() !== req.user.id && req.user.Role !== 'admin') {
//       return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
//     }
//     if (category !== undefined) {
//       const categoryDoc: { _id: Types.ObjectId; name: string } | null = await Category.findOne({ name: category });
//       if (!categoryDoc) {
//         return res.status(400).json({ message: `Category '${category}' not found.` });
//       }
//       product.category = categoryDoc._id;
//     }
//     if (title !== undefined) product.title = title;
//     if (description !== undefined) product.description = description;
//     if (stock !== undefined) product.stock = stock;
//     if (brand !== undefined) product.brand = brand;
//     if (rating !== undefined) product.rating = rating;
//     if (image !== undefined) product.image = image;
//     if (price !== undefined) {
//       product.price = price;
//       if (salePrice !== undefined) {
//         product.salePrice = salePrice;
//         product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
//       } else if (discountPercentage !== undefined) {
//         product.discountPercentage = discountPercentage;
//         product.salePrice = price - price * (discountPercentage / 100);
//       } else {
//         product.salePrice = price;
//         product.discountPercentage = 0;
//       }
//     } else if (salePrice !== undefined) {
//       product.salePrice = salePrice;
//       product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
//     } else if (discountPercentage !== undefined) {
//       product.discountPercentage = discountPercentage;
//       product.salePrice = product.price - product.price * (discountPercentage / 100);
//     }
//     await product.save();
//     return res.status(200).json({
//       message: "Product updated successfully.",
//       product,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
//     const deleteProduct = async (req: Request<{ _id: string }>, res: Response) => {
//   const { _id } = req.params;
//   try {
//     const deleteProduct = await Product.findByIdAndDelete(_id);
//     if (!deleteProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     if (deleteProduct.image) {
//       const imagePath = path.join(process.cwd(), deleteProduct.image.startsWith('uploads/') ? deleteProduct.image.slice(8) : deleteProduct.image);
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
// const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
//   const { id } = req.params;
//   const { category, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } = req.body;
//   try {
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found." });
//     }
//     // Check if the user is the seller or an admin
//     if (product.seller.toString() !== req.user.id && req.user.Role !== 'admin') {
//       return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
//     }
//     // If category is provided, update it, else keep existing category
//     if (category !== undefined) {
//       const categoryDoc: { _id: Types.ObjectId; name: string } | null = await Category.findOne({ name: category });
//       if (!categoryDoc) {
//         return res.status(400).json({ message: `Category '${category}' not found.` });
//       }
//       product.category = categoryDoc._id;
//     }
//     // Only update fields that are provided
//     if (title !== undefined) product.title = title;
//     if (description !== undefined) product.description = description;
//     if (stock !== undefined) product.stock = stock;
//     if (brand !== undefined) product.brand = brand;
//     if (rating !== undefined) product.rating = rating;
//     // Only update image if provided
//     if (image !== undefined && image !== '') {
//       product.image = image;
//     }
//     // Handle price and salePrice logic if provided
//     if (price !== undefined && price !== '') {
//       product.price = price;
//       if (salePrice !== undefined && salePrice !== '') {
//         product.salePrice = salePrice;
//         product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
//       } else if (discountPercentage !== undefined && discountPercentage !== '') {
//         product.discountPercentage = discountPercentage;
//         product.salePrice = price - price * (discountPercentage / 100);
//       } else {
//         // If no salePrice or discountPercentage is provided, keep previous values
//         if (product.salePrice === undefined) {
//           product.salePrice = price; // default to price if no salePrice exists
//         }
//         if (product.discountPercentage === undefined) {
//           product.discountPercentage = 0; // default to 0% if no discount exists
//         }
//       }
//     } else if (salePrice !== undefined && salePrice !== '') {
//       product.salePrice = salePrice;
//       product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
//     } else if (discountPercentage !== undefined && discountPercentage !== '') {
//       product.discountPercentage = discountPercentage;
//       product.salePrice = product.price - product.price * (discountPercentage / 100);
//     }
//     // Save the updated product
//     await product.save();
//     return res.status(200).json({
//       message: "Product updated successfully.",
//       product,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
// Update the category assignment part to ensure proper type handling:
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { categoryId, title, description, price, salePrice, discountPercentage, stock, brand, rating, image } = req.body;
    try {
        const product = await productModel_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        // Check if the user is the seller or an admin
        const userId = req.user?.id;
        const userRole = req.user?.Role;
        if (product.seller.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
        }
        // If categoryId is provided, update the category, else keep existing category
        if (categoryId !== undefined) {
            const categoryDoc = await categoryModel_1.Category.findById(categoryId);
            if (!categoryDoc) {
                return res.status(400).json({ message: `Category with ID '${categoryId}' not found.` });
            }
            product.category = categoryDoc._id; // Set category to the new category ID
        }
        // Only update fields that are provided
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
        // Handle price and salePrice logic if provided
        if (price !== undefined && price !== '') {
            product.price = price;
            // Calculate salePrice if discountPercentage is provided
            if (discountPercentage !== undefined && discountPercentage !== '') {
                product.discountPercentage = discountPercentage;
                product.salePrice = price - (price * (discountPercentage / 100));
            }
            // If salePrice is provided, calculate discountPercentage
            else if (salePrice !== undefined && salePrice !== '') {
                product.salePrice = salePrice;
                product.discountPercentage = Math.round(((price - salePrice) / price) * 100);
            }
            else {
                // If neither salePrice nor discountPercentage is provided, set salePrice to price
                product.salePrice = price;
                product.discountPercentage = 0;
            }
        }
        // If salePrice is provided without price, calculate discountPercentage based on price
        else if (salePrice !== undefined && salePrice !== '') {
            product.salePrice = salePrice;
            product.discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
        }
        // If discountPercentage is provided, calculate salePrice based on the existing price
        else if (discountPercentage !== undefined && discountPercentage !== '') {
            product.discountPercentage = discountPercentage;
            product.salePrice = product.price - (product.price * (discountPercentage / 100));
        }
        // Handle image update (if image is provided)
        if (req.file) {
            // If a new image is uploaded, remove the old image
            if (product.image) {
                const oldImagePath = path_1.default.join(process.cwd(), product.image);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath); // Remove the old image
                }
            }
            // Update the image with the new one
            const imageUrl = `/uploads/${req.file.filename}`;
            product.image = imageUrl;
        }
        else if (typeof image === 'string') {
            // If image is sent as a URL string in the body
            product.image = image;
        }
        // Save the updated product
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
        // Check if logged-in user is the seller
        if (product.seller.toString() !== req.user.id && req.user.Role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized: You can only update your own product" });
        }
        await product.deleteOne();
        if (product.image) {
            const imagePath = path_1.default.join(process.cwd(), product.image.startsWith('uploads/') ? product.image.slice(8) : product.image);
            fs_1.default.unlink(imagePath, err => {
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
// const getProductById = async (req: Request<{ _id: string }>, res: Response) => {
//   try {
//     const { _id } = req.params;
//     // Validate if ID is a valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       return res.status(400).json({ message: "Invalid product ID format." });
//     }
//     const product = await Product.findById(_id).populate("category", "name")
//     .populate("brand", "name");
//     if (!product) {
//       return res.status(404).json({ message: "Product not found." });
//     }
//     return res.status(200).json({
//       message: "Product fetched successfully.",
//       product,
//     });
//   } catch (error) {
//     console.error("Error fetching product by ID:", error);
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };
const getProductById = async (req, res) => {
    try {
        const { _id } = req.params;
        const userId = req.user?.id; // Assuming the user's ID is available via `req.user.id`
        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid product ID format." });
        }
        // Fetch the product from the database
        const product = await productModel_1.Product.findById(_id)
            .populate("category", "name")
            .populate("brand", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        // Check if the user is logged in and has a wishlist
        let isInWishlist = false;
        if (userId) {
            // Query the Wishlist model to check if the product is in the user's wishlist
            const wishlistItem = await wishlistModel_1.default.findOne({ userId, productId: _id });
            if (wishlistItem) {
                isInWishlist = true; // If product is in the wishlist, set flag to true
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
