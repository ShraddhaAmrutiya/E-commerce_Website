import { Request, Response } from "express";
import Order from "../Models/orderModel";
import Cart from "../Models/cartModel";
import { Product } from "../Models/productModel";
import { User } from "../Models/userModel";
import mongoose from "mongoose";

export const placeOrderFromCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: req.t("order.InvalidUserId") });
    }

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.status(404).json({ message: req.t("order.CartNotFound") });
    }

    if (cart.products.length === 0) {
      return res.status(400).json({ message: req.t("order.CartEmpty") });
    }

    let totalPrice = 0;
    const products = cart.products.map((item) => {
      const product = item.productId as any;

      if (!product) {
        return res.status(400).json({ message: req.t("order.CartEmpty") });
      }

      totalPrice += product.price * item.quantity;

      return {
        productId: product._id,
        quantity: item.quantity,
      };
    });

    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      products,
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();

    for (const item of cart.products) {
      const product = item.productId as any;

      if (!product) {
        return res.status(400).json({ message: "Product details missing for cart item." });
      }

      if (product.stock == null || product.stock < item.quantity) {
        return res.status(400).json({ message: req.t("order.NotEnoughStock", { title: product.title || "Unknown" }) });
      }

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    await Cart.findOneAndDelete({ userId });

    return res.status(201).json({ message: req.t("order.PlacedSuccessfully"), order: newOrder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

export const placeDirectOrder = async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: req.t("order.InvalidInput") });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: req.t("user.NotFound") });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: req.t("product.notFound") });
    }

    if (product.stock === 0) {
      return res.status(400).json({ message: req.t("order.OutOfStock") });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: req.t("order.NotEnoughStock", { product: product.title }),
      });
    }

    const totalPrice = product.salePrice * quantity;

    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      products: [{ productId: new mongoose.Types.ObjectId(productId), quantity }],
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();

    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });

    return res.status(201).json({
      message: req.t("order.Success"),
      order: newOrder,
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).populate("products.productId");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: req.t("order.NoOrders") });
    }

    return res.status(200).json({
      message: req.t("order.OrdersRetrieved"),
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};

export const getOrderRedirectButton = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: req.t("order.InvalidUserId") });
    }

    const pastOrders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (pastOrders.length === 0) {
      return res.status(404).json({ message: req.t("order.NoPastOrders") });
    }

    const pastOrdersWithProductDetails = await Promise.all(
      pastOrders.map(async (order) => {
        const productsWithDetails = await Promise.all(
          order.products.map(async (product) => {
            const productDetails = await Product.findById(product.productId);

            if (!productDetails) {
              return {
                productId: product.productId,
                quantity: product.quantity,
                name: req.t("order.UnknownProduct"),
                description: req.t("order.NoDescription"),
                salePrice: 0,
                totalPrice: 0,
                image: "/images/placeholder.jpg",
              };
            }

            const totalPrice = productDetails.salePrice * product.quantity;

            return {
              productId: product.productId,
              quantity: product.quantity,
              name: productDetails.title,
              description: productDetails.description,
              salePrice: productDetails.salePrice,
              totalPrice,
              images: productDetails.images || [],
            };
          })
        );

        const orderTotal = productsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);

        return {
          orderId: order._id,
          createdAt: order.createdAt,
          totalPrice: order.totalPrice,
          orderTotal,
          status: order.status,
          products: productsWithDetails,
        };
      })
    );

    const redirectUrl = `/orders/${pastOrdersWithProductDetails[0].orderId}`;

    return res.status(200).json({
      message: req.t("order.PastOrdersFound"),
      redirectUrl,
      pastOrders: pastOrdersWithProductDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};
