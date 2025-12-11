import { Request, Response } from "express";
import Order from "../Models/orderModel";
import Cart from "../Models/cartModel";
import { Product } from "../Models/productModel";
import { User } from "../Models/userModel";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import multer from "multer";
// multer memory storage (already used in your router)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const placeOrderFromCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: req.t("order.InvalidUserId") });
    }

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: req.t("order.CartEmpty") });
    }

    const uploadedImages = req.files as Express.Multer.File[] | [];
    let totalPrice = 0;

    const products = cart.products.map((item, index) => {
      const product = item.productId as any;
      totalPrice += product.price * item.quantity;

      return {
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        customization:
          req.body[`products[${index}][customization]`] ||
          req.body.products?.[index]?.customization ||
          "",
        image: uploadedImages[index] || null,
      };
    });

    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      products: products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        customization: p.customization,
      })),
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();

    for (const item of cart.products) {
      const product = item.productId as any;
      if (!product) return res.status(400).json({ message: "Product details missing." });

      if (product.stock == null || product.stock < item.quantity) {
        return res.status(400).json({
          message: req.t("order.NotEnoughStock", { title: product.title }),
        });
      }

      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    await Cart.findOneAndDelete({ userId });

    // -------------------------------------------------------------------
    // Elegant Premium Email Theme
    // -------------------------------------------------------------------
    const sendEmails = async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      const user = await User.findById(userId);

      const productRows = products
        .map((item, index) => {
          const cid = `image_${index}`;
          return `
            <tr>
              <td style="border:1px solid #e5dccb; padding:10px; color:#3b3b3b;">${item.title}</td>
              <td style="border:1px solid #e5dccb; padding:10px; text-align:center; color:#3b3b3b;">${item.quantity}</td>
              <td style="border:1px solid #e5dccb; padding:10px; text-align:right; color:#b08968;">₹${item.price}</td>
              <td style="border:1px solid #e5dccb; padding:10px; text-align:right; color:#b08968;">₹${item.price * item.quantity}</td>
              <td style="border:1px solid #e5dccb; padding:10px; color:#6d6d6d;">${item.customization || "-"}</td>
              <td style="border:1px solid #e5dccb; padding:10px; text-align:center;">
                ${
                  item.image
                    ? `<img src="cid:${cid}" style="max-width:90px; border-radius:10px; border:1px solid #d4c1a1;" />`
                    : `<span style="color:#aaa;">No Image</span>`
                }
              </td>
            </tr>
          `;
        })
        .join("");

      const attachments = products
        .filter((p) => p.image)
        .map((p, index) => ({
          filename: `product_${index + 1}.jpg`,
          content: p.image?.buffer,
          contentType: p.image?.mimetype,
          cid: `image_${index}`,
        }));

      const buildEmailHTML = (title: string, includeUser = false) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f9f7f3; padding:30px;">
        <div style="
          max-width:750px; 
          margin:auto; 
          background:white; 
          border-radius:16px; 
          box-shadow:0 8px 28px rgba(0,0,0,0.08);
          border:1px solid #eee;
          overflow:hidden;
        ">

          <!-- Header -->
          <div style="
            padding:35px; 
            text-align:center;
            background:#faf5ef;
            border-bottom:2px solid #d8c3a5;
          ">
            <h1 style="margin:0; font-size:28px; font-family:'Georgia', serif; color:#6a4e23;">
              ${title}
            </h1>
            <p style="margin-top:5px; color:#8a7f70;">Premium Handmade Resin Art</p>
          </div>

          ${
            includeUser
              ? `
            <div style="padding:20px; color:#4b4b4b; font-size:16px;">
              <p><strong style="color:#7a5e3b;">Customer:</strong> ${user?.userName}</p>
              <p><strong style="color:#7a5e3b;">Email:</strong> ${user?.email}</p>
              <p><strong style="color:#7a5e3b;">Phone:</strong> ${user?.phone || "N/A"}</p>
            </div>`
              : ""
          }

          <!-- Products Table -->
          <div style="padding:20px;">
            <table style="width:100%; border-collapse:collapse; background:white;">
              <thead>
                <tr style="background:#f6f1e9; color:#6a4e23;">
                  <th style="border:1px solid #e5dccb; padding:10px;">Product</th>
                  <th style="border:1px solid #e5dccb; padding:10px;">Qty</th>
                  <th style="border:1px solid #e5dccb; padding:10px;">Price</th>
                  <th style="border:1px solid #e5dccb; padding:10px;">Subtotal</th>
                  <th style="border:1px solid #e5dccb; padding:10px;">Customization</th>
                  <th style="border:1px solid #e5dccb; padding:10px;">Image</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>

            <p style="
              text-align:right; 
              margin-top:15px; 
              font-size:20px; 
              font-weight:bold; 
              color:#7a5e3b;
            ">
              Total: ₹${totalPrice}
            </p>
          </div>

          <!-- Footer -->
          <div style="
            padding:25px; 
            text-align:center; 
            background:#faf7f2; 
            border-top:1px solid #e8ddcc;
            font-size:14px;
            color:#6d6d6d;
          ">
            <p>🏬 ${process.env.STORE_NAME || "Aaraksha Resin Art"}</p>
            <p>📞 ${process.env.ADMIN_PHONE || "N/A"} | 📧 ${process.env.ADMIN_EMAIL || "support@example.com"}</p>
            ${
              process.env.STORE_WEBSITE
                ? `<p>🌐 <a href="${process.env.STORE_WEBSITE}" target="_blank" style="color:#7a5e3b; text-decoration:none;">${process.env.STORE_WEBSITE}</a></p>`
                : ""
            }
            <p style="margin-top:10px; font-style:italic;">Thank you for choosing handmade elegance ✨</p>
          </div>

        </div>
      </div>
      `;

      // -------------------- USER EMAIL --------------------
      if (user?.email) {
        await transporter.sendMail({
          from: `"Aaraksha Resin Art" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "✨ Your Elegant Resin Art Order Confirmation",
          html: buildEmailHTML("Your Order Summary"),
          attachments,
        });
      }

      // -------------------- ADMIN EMAIL --------------------
      if (process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: `"Aaraksha Resin Art" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: "🛒 New Elegant Resin Art Order",
          html: buildEmailHTML("New Order Notification", true),
          attachments,
        });
      }
    };

    sendEmails();

    return res.status(201).json({
      message: req.t("order.PlacedSuccessfully"),
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Order placement error:", error);
    return res.status(500).json({ message: req.t("auth.ServerError") });
  }
};


export const placeDirectOrder = async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity, customization } = req.body;
    const file = req.file;
    const qty = Number(quantity);

    if (!userId || !productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock === 0) return res.status(400).json({ message: "Out of stock" });
    if (product.stock < qty) return res.status(400).json({ message: "Not enough stock" });

    const totalPrice = product.salePrice * qty;

    const newOrder = new Order({
      userId,
      products: [{ productId, quantity: qty, customization }],
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -qty } });

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    // -----------------------------------------------------------------
    // ⭐ CREAM / BEIGE + GOLD ELEGANT THEME (MATCHES YOUR SCREENSHOT)
    // -----------------------------------------------------------------
    const buildEmailHTML = (headerText: string, includeUserInfo = false) => `
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif; background:#f7f3ee; padding:40px;">
        <div style="max-width:750px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; 
        box-shadow:0 6px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#faf4eb; padding:30px 20px; border-bottom:1px solid #e6d7c2; text-align:center;">
            <h1 style="margin:0; font-size:28px; color:#6b522c; font-weight:700;">
              ${headerText}
            </h1>
            <p style="margin:5px 0 0; font-size:15px; color:#9c7f4c;">
              Premium Handmade Resin Art
            </p>
          </div>

          <!-- User Info (Admin Only) -->
          ${includeUserInfo ? `
          <div style="padding:25px; color:#4a3d2c; font-size:15px;">
            <p><strong>Customer:</strong> ${user.userName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || "-"}</p>
          </div>` : ""}

          <!-- Order Table -->
          <div style="padding:25px;">
            <table style="width:100%; border-collapse:collapse; color:#4a3d2c; font-size:15px;">
              <thead>
                <tr style="background:#f3e8d9;">
                  <th style="border:1px solid #e6d7c2; padding:10px;">Product</th>
                  <th style="border:1px solid #e6d7c2; padding:10px; text-align:center;">Qty</th>
                  <th style="border:1px solid #e6d7c2; padding:10px; text-align:right;">Price</th>
                  <th style="border:1px solid #e6d7c2; padding:10px; text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border:1px solid #e6d7c2; padding:10px;">${product.title}</td>
                  <td style="border:1px solid #e6d7c2; padding:10px; text-align:center;">${qty}</td>
                  <td style="border:1px solid #e6d7c2; padding:10px; text-align:right;">₹${product.salePrice}</td>
                  <td style="border:1px solid #e6d7c2; padding:10px; text-align:right;">₹${totalPrice}</td>
                </tr>
              </tbody>
            </table>

            <p style="text-align:right; margin-top:20px; font-size:18px; font-weight:700; color:#6b522c;">
              Total: ₹${totalPrice}
            </p>
          </div>

          <!-- Customization -->
          ${customization ? `
          <div style="padding:20px; color:#4a3d2c;">
            <strong>Customization:</strong> ${customization}
          </div>` : ""}

          <!-- Uploaded Image -->
          ${file ? `
          <div style="padding:20px;">
            <p style="color:#6b522c;">Uploaded Image:</p>
            <img src="cid:customImage" style="max-width:150px; border-radius:12px; border:1px solid #d8c4a7;" />
          </div>` : ""}

          <!-- Footer -->
          <div style="background:#faf4eb; padding:25px; text-align:center; border-top:1px solid #e6d7c2; color:#7a6646; font-size:14px;">
            <p style="margin:0;">🏪 ${process.env.STORE_NAME || 'Aaraksha Resin Art'}</p>
            <p style="margin:4px 0;">📧 ${process.env.ADMIN_EMAIL}</p>
            <p style="margin-top:10px; font-style:italic;">Thank you for choosing handmade elegance ✨</p>
          </div>

        </div>
      </div>
    `;

    // -------------------- USER EMAIL --------------------
    if (user.email) {
      const attachments: any[] = [];

      if (file) {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
          cid: "customImage",
        });
      }

      await transporter.sendMail({
        from: `"Aaraksha Resin Art" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "✨ Your Order is Confirmed - Aaraksha Resin Art",
        html: buildEmailHTML("Your Order Summary"),
        attachments,
      });
    }

    // -------------------- ADMIN EMAIL --------------------
    if (process.env.ADMIN_EMAIL) {
      const adminAttachments = file
        ? [{ filename: file.originalname, content: file.buffer, contentType: file.mimetype }]
        : [];

      await transporter.sendMail({
        from: `"Aaraksha Resin Art" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "🧵 New Handmade Order Received",
        html: buildEmailHTML("New Order Notification", true),
        attachments: adminAttachments,
      });
    }

    return res.status(201).json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.error("Order Direct Error:", err);
    return res.status(500).json({ message: "Server error" });
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
                images: "/images/placeholder.jpg",
              };
            }

            const salePrice = productDetails.salePrice ?? productDetails.price;
            const totalPrice = salePrice * product.quantity;

            return {
              productId: product.productId,
              quantity: product.quantity,
              name: productDetails.title,
              description: productDetails.description,
              salePrice,
              totalPrice,
              images: productDetails.images || [],
            };
          })
        );

        const orderTotal = productsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);

        return {
          orderId: order._id,
          createdAt: order.createdAt,
          totalPrice: orderTotal,
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
