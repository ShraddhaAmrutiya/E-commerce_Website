import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  productId?: mongoose.Types.ObjectId;
  status: "pending" | "reviewed" | "responded";
  createdAt: Date;
}

const InquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "responded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInquiry>("Inquiry", InquirySchema);
