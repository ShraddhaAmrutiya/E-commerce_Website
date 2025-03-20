import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  products: { productId: mongoose.Types.ObjectId; quantity: number }[];
  totalPrice: number;
  status: string; // Pending, Completed, Cancelled, etc.
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
