"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderRedirectButton = exports.getOrdersByUser = exports.placeDirectOrder = exports.placeOrderFromCart = void 0;
const orderModel_1 = __importDefault(require("../Models/orderModel"));
const cartModel_1 = __importDefault(require("../Models/cartModel"));
const productModel_1 = require("../Models/productModel");
const userModel_1 = require("../Models/userModel");
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const placeOrderFromCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: req.t("order.InvalidUserId") });
        }
        const cart = await cartModel_1.default.findOne({ userId }).populate("products.productId");
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: req.t("order.CartEmpty") });
        }
        let totalPrice = 0;
        const products = cart.products.map((item) => {
            const product = item.productId;
            totalPrice += product.price * item.quantity;
            return { productId: product._id, quantity: item.quantity };
        });
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products,
            totalPrice,
            status: "Pending",
        });
        await newOrder.save();
        for (const item of cart.products) {
            const product = item.productId;
            if (!product) {
                return res
                    .status(400)
                    .json({ message: "Product details missing for cart item." });
            }
            if (product.stock == null || product.stock < item.quantity) {
                return res.status(400).json({
                    message: req.t("order.NotEnoughStock", { title: product.title || "Unknown" }),
                });
            }
            await productModel_1.Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
        }
        await cartModel_1.default.findOneAndDelete({ userId });
        const sendEmails = async () => {
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            const user = await userModel_1.User.findById(userId);
            // User confirmation mail
            if (user?.email) {
                const productRows = cart.products
                    .map((item) => {
                    const product = item.productId;
                    return `
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${product.title}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:center;">${item.quantity}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.price}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.price * item.quantity}</td>
            </tr>`;
                })
                    .join("");
                const userMailOptions = {
                    from: `"Aaraksha resin art" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `${process.env.STORE_NAME || "ResinArt Creations"} - Order Placed Successfully 🎨`,
                    html: `
    <div style="font-family: 'Trebuchet MS', sans-serif; max-width:600px; margin:auto; border:2px solid #f4c2c2; border-radius:15px; overflow:hidden;">
      
      <!-- Header -->
      <div style="background:#f4c2c2; padding:20px; text-align:center; color:white; font-size:24px; font-weight:bold;">
        🎨 ${process.env.STORE_NAME || "ResinArt Creations"}
      </div>
      
      <!-- Body -->
      <div style="padding:20px; color:#333;">
        <h2 style="color:#4CAF50;">Hi ${user.userName},</h2>
        <p>
          Thank you for your order! Your unique resin art pieces are being prepared with love and care. 💖
        </p>

        <!-- Order Summary -->
        <h3 style="margin-top:20px;">🛒 Order Summary:</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f9e4e4;">
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Product</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:center;">Qty</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Price</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cart.products
                        .map((item) => {
                        const product = item.productId;
                        return `
                  <tr>
                    <td style="border:1px solid #ddd; padding:8px;">${product.title}</td>
                    <td style="border:1px solid #ddd; padding:8px; text-align:center;">${item.quantity}</td>
                    <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.price}</td>
                    <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.price * item.quantity}</td>
                  </tr>
                `;
                    })
                        .join("")}
          </tbody>
        </table>

        <h2 style="text-align:right; margin-top:20px; color:#4CAF50;">
          💰 Total: ₹${totalPrice}
        </h2>

        <!-- Store Details -->
        <h3 style="margin-top:30px;">Store Details:</h3>
        <ul style="list-style:none; padding:0; font-size:14px; color:#333;">
          <li>🏬 Store: ${process.env.STORE_NAME || "ResinArt Creations"}</li>
          <li>📞 Phone: ${process.env.ADMIN_PHONE || "Not Provided"}</li>
          <li>📧 Email: ${process.env.ADMIN_EMAIL || "support@resinart.com"}</li>
          ${process.env.STORE_ADDRESS
                        ? `<li>📍 Address: ${process.env.STORE_ADDRESS}</li>`
                        : ""}
          ${process.env.STORE_WEBSITE
                        ? `<li>🌐 Website: <a href="${process.env.STORE_WEBSITE}" target="_blank">${process.env.STORE_WEBSITE}</a></li>`
                        : ""}
        </ul>

        <p style="margin-top:20px; font-size:14px; color:#555;">
          We are excited to create and deliver your one-of-a-kind resin art pieces. Thank you for supporting handcrafted art! ✨
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f4c2c2; padding:10px; text-align:center; font-size:12px; color:white;">
        © ${new Date().getFullYear()} ${process.env.STORE_NAME || "ResinArt Creations"}. All Rights Reserved.
      </div>
    </div>
  `,
                };
                await transporter.sendMail(userMailOptions);
            }
            else {
                console.warn("⚠️ User email not found, skipping user mail");
            }
            // Admin notification mail
            if (process.env.ADMIN_EMAIL) {
                const productRows = cart.products
                    .map((item) => {
                    const product = item.productId;
                    return `
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${product.title}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:center;">${item.quantity}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.price}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.price * item.quantity}</td>
            </tr>`;
                })
                    .join("");
                const adminMailOptions = {
                    from: `"Aaraksha resin art" <${process.env.EMAIL_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: "🚀 New Order Received",
                    html: `
          <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:10px; overflow:hidden;">
            <div style="background:#4CAF50; color:white; padding:15px; text-align:center; font-size:20px;">
              📢 New Order Notification
            </div>
            <div style="padding:20px; color:#333;">
              <p><strong>Customer:</strong> ${user?.userName || "Unknown"}</p>
              <p><strong>Email:</strong> ${user?.email || "no email"}</p>
              <p><strong>Phone:</strong> ${user?.phone || "no phone"}</p>

              <h3 style="margin-top:20px;">🛒 Order Details</h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#f4f4f4;">
                    <th style="border:1px solid #ddd; padding:8px; text-align:left;">Product</th>
                    <th style="border:1px solid #ddd; padding:8px; text-align:center;">Qty</th>
                    <th style="border:1px solid #ddd; padding:8px; text-align:right;">Price</th>
                    <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                </tbody>
              </table>

              <h2 style="text-align:right; margin-top:20px; color:#4CAF50;">💰 Total: ₹${totalPrice}</h2>

              <p style="margin-top:30px;">Please follow up with the customer at the earliest.</p>
            </div>
            <div style="background:#f9f9f9; padding:10px; text-align:center; font-size:12px; color:#777;">
              📧 Auto-generated by E-Commerce System
            </div>
          </div>
        `,
                };
                await transporter.sendMail(adminMailOptions);
            }
            else {
                console.warn("⚠️ ADMIN_EMAIL not set in .env, skipping admin mail");
            }
        };
        sendEmails();
        return res.status(201).json({
            message: req.t("order.PlacedSuccessfully"),
            order: newOrder,
        });
    }
    catch (error) {
        console.error("❌ Order placement error:", error);
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.placeOrderFromCart = placeOrderFromCart;
// Do the same for placeDirectOrder
const placeDirectOrder = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || !quantity || quantity <= 0)
            return res.status(400).json({ message: req.t("order.InvalidInput") });
        const user = await userModel_1.User.findById(userId);
        const product = await productModel_1.Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: req.t("product.notFound") });
        if (product.stock === 0)
            return res.status(400).json({ message: req.t("order.OutOfStock") });
        if (product.stock < quantity)
            return res.status(400).json({
                message: req.t("order.NotEnoughStock", { product: product.title }),
            });
        const totalPrice = product.salePrice * quantity;
        const newOrder = new orderModel_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            products: [
                { productId: new mongoose_1.default.Types.ObjectId(productId), quantity },
            ],
            totalPrice,
            status: "Pending",
        });
        await newOrder.save();
        await productModel_1.Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
        // -------------------- ASYNC EMAILS --------------------
        const sendEmails = async () => {
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
            // User Confirmation Email
            if (user?.email) {
                const userMailOptions = {
                    from: `"Aaraksha resin art" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `${process.env.STORE_NAME || "Our Store"} - Order Placed Successfully ✅`,
                    html: `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #eee; border-radius:10px; overflow:hidden;">

      <!-- Header -->
      <div style="background:#4CAF50; padding:20px; text-align:center; color:white; font-size:22px; font-weight:bold;">
        🛍️ ${process.env.STORE_NAME || "Our Store"}
      </div>

      <!-- Body -->
      <div style="padding:20px; color:#333;">
        <h2 style="color:#4CAF50; text-align:center;">Thank you for your order, ${user.userName}!</h2>

        <p style="font-size:15px; text-align:center; margin-top:10px;">
          Your order has been placed successfully. Our team will contact you shortly.
        </p>

        <!-- Order Details -->
        <h3 style="margin-top:20px;">🛒 Order Details:</h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="border:1px solid #ddd; padding:8px; text-align:left;">Product</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:center;">Qty</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Price</th>
              <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${product.title}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:center;">${quantity}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.salePrice}</td>
              <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.salePrice * quantity}</td>
            </tr>
          </tbody>
        </table>

        <!-- Store Contact -->
        <h3 style="margin-top:20px;">📞 Store Contact:</h3>
        <ul style="list-style:none; padding:0; font-size:14px; color:#333;">
          <li><strong>🏬 Store:</strong> ${process.env.STORE_NAME || "My Online Store"}</li>
          <li><strong>📞 Phone:</strong> ${process.env.ADMIN_PHONE || "Not Provided"}</li>
          <li><strong>📧 Email:</strong> ${process.env.ADMIN_EMAIL || "support@example.com"}</li>
          ${process.env.STORE_WEBSITE
                        ? `<li><strong>🌐 Website:</strong> <a href="${process.env.STORE_WEBSITE}" target="_blank">${process.env.STORE_WEBSITE}</a></li>`
                        : ""}
        </ul>

        <p style="margin-top:20px; font-size:14px; color:#555; text-align:center;">
          We truly appreciate your business and hope to serve you again soon 🙏
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9f9f9; padding:10px; text-align:center; font-size:12px; color:#777; border-top:1px solid #eee;">
        © ${new Date().getFullYear()} ${process.env.STORE_NAME || "My Online Store"}. All Rights Reserved.
      </div>

    </div>
  `,
                };
                await transporter.sendMail(userMailOptions);
            }
            // Admin Notification Email
            if (process.env.ADMIN_EMAIL) {
                const adminMailOptions = {
                    from: `"Aaraksharesin art" <${process.env.EMAIL_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: "🚀 New Order Received",
                    html: `
          <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:10px; overflow:hidden;">
            <div style="background:#4CAF50; color:white; padding:15px; text-align:center; font-size:20px;">
              📢 New Order Notification
            </div>
            <div style="padding:20px; color:#333;">
              <p><strong>Customer:</strong> ${user?.userName || "Unknown"}</p>
              <p><strong>Email:</strong> ${user?.email || "no email"}</p>
              <p><strong>Phone:</strong> ${user?.phone || "no phone"}</p>

              <h3 style="margin-top:20px;">🛒 Order Details</h3>
              <table style="width:100%; border-collapse:collapse;">
                <tr>
                  <th style="border:1px solid #ddd; padding:8px;">Product</th>
                  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Qty</th>
                  <th style="border:1px solid #ddd; padding:8px; text-align:right;">Price</th>
                  <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
                </tr>
                <tr>
                  <td style="border:1px solid #ddd; padding:8px;">${product.title}</td>
                  <td style="border:1px solid #ddd; padding:8px; text-align:center;">${quantity}</td>
                  <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.salePrice}</td>
                  <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${totalPrice}</td>
                </tr>
              </table>
            </div>
          `,
                };
                transporter.sendMail(adminMailOptions).catch(console.error);
            }
            // Admin Email
            if (process.env.ADMIN_EMAIL) {
                const adminMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL,
                    subject: "🚀 New Order Received",
                    html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:10px; overflow:hidden;">
              <div style="background:#4CAF50; color:white; padding:15px; text-align:center; font-size:20px;">
                📢 New Order Notification
              </div>
              <div style="padding:20px; color:#333;">
                <p><strong>Customer:</strong> ${user.userName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone || "N/A"}</p>
                <h3>🛒 Order Details</h3>
                <table style="width:100%; border-collapse:collapse;">
                  <tr>
                    <th style="border:1px solid #ddd; padding:8px;">Product</th>
                    <th style="border:1px solid #ddd; padding:8px; text-align:center;">Qty</th>
                    <th style="border:1px solid #ddd; padding:8px; text-align:right;">Price</th>
                    <th style="border:1px solid #ddd; padding:8px; text-align:right;">Subtotal</th>
                  </tr>
                  <tr>
                    <td style="border:1px solid #ddd; padding:8px;">${product.title}</td>
                    <td style="border:1px solid #ddd; padding:8px; text-align:center;">${quantity}</td>
                    <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${product.salePrice}</td>
                    <td style="border:1px solid #ddd; padding:8px; text-align:right;">₹${totalPrice}</td>
                  </tr>
                </table>
              </div>
            </div>
          `,
                };
                transporter.sendMail(adminMailOptions).catch(console.error);
            }
        };
        sendEmails();
        return res.status(201).json({ message: req.t("order.Success"), order: newOrder });
    }
    catch (error) {
        console.error("Order Creation Error:", error);
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.placeDirectOrder = placeDirectOrder;
const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await orderModel_1.default.find({ userId }).populate("products.productId");
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: req.t("order.NoOrders") });
        }
        return res.status(200).json({
            message: req.t("order.OrdersRetrieved"),
            orders,
        });
    }
    catch (error) {
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getOrdersByUser = getOrdersByUser;
const getOrderRedirectButton = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: req.t("order.InvalidUserId") });
        }
        const pastOrders = await orderModel_1.default.find({ userId }).sort({ createdAt: -1 });
        if (pastOrders.length === 0) {
            return res.status(404).json({ message: req.t("order.NoPastOrders") });
        }
        const pastOrdersWithProductDetails = await Promise.all(pastOrders.map(async (order) => {
            const productsWithDetails = await Promise.all(order.products.map(async (product) => {
                const productDetails = await productModel_1.Product.findById(product.productId);
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
            }));
            const orderTotal = productsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
            return {
                orderId: order._id,
                createdAt: order.createdAt,
                totalPrice: order.totalPrice,
                orderTotal,
                products: productsWithDetails,
            };
        }));
        const redirectUrl = `/orders/${pastOrdersWithProductDetails[0].orderId}`;
        return res.status(200).json({
            message: req.t("order.PastOrdersFound"),
            redirectUrl,
            pastOrders: pastOrdersWithProductDetails,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: req.t("auth.ServerError") });
    }
};
exports.getOrderRedirectButton = getOrderRedirectButton;
