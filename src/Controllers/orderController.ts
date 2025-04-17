import { Request, Response } from "express";
import Order from "../Models/orderModel";
import Cart from "../Models/cartModel";
import { Product } from "../Models/productModel";
import { User } from "../Models/userModel";
import mongoose from "mongoose";

// export const placeOrderFromCart = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;

//     const cart = await Cart.findOne({ userId }).populate("products.productId");
//     if (!cart || cart.products.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     let totalPrice = 0;
//     const products = cart.products.map((item) => {
//       const product = item.productId as any;
//       totalPrice += product.price * item.quantity;
//       return {
//         productId: product._id,
//         stock: item.quantity,
//       };
//     });

//     const newOrder = new Order({
//       userId: new mongoose.Types.ObjectId(userId),
//       products,
//       totalPrice,
//       status: "Pending",
//     });

//     await newOrder.save();

//     for (const item of cart.products) {
//       const product = item.productId as any;
//       await Product.findByIdAndUpdate(product._id, {
//         $inc: { stock: -item.quantity },
//       });
//     }

//     await Cart.findOneAndDelete({ userId });

//     return res.status(201).json({ message: "Order placed successfully", order: newOrder });
//   } catch (error) {
//     return res.status(500).json({ error: (error as Error).message });
//   }
// };

// Place Direct Order (Without Adding to Cart)
export const placeOrderFromCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;
    const products = cart.products.map((item) => {
      const product = item.productId as any;
      totalPrice += product.price * item.quantity;
      return {
        productId: product._id,
        stock: item.quantity,
      };
    });

    // Create the new order with status "Pending"
    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      products,
      totalPrice,
      status: "Pending", // Set the order status to "Pending"
    });

    await newOrder.save();

    // Update the product stock and remove cart items
    for (const item of cart.products) {
      const product = item.productId as any;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    await Cart.findOneAndDelete({ userId });

    return res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const placeDirectOrder = async (req: Request, res: Response) => {
  try {
    const { userId, productId, stock } = req.body;

  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < stock) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const totalPrice = product.price * stock;

    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      products: [{ productId: new mongoose.Types.ObjectId(productId), quantity: stock }], // 🔹 Fix: Use `quantity`
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();

    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -stock },
    });

    return res.status(201).json({ message: "Direct order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).populate("products.productId");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    return res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};
