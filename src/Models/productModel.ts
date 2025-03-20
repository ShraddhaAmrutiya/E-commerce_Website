import mongoose, { Schema, Document, model,Types } from "mongoose";

export interface IProduct extends Document {
  category:Types.ObjectId;
  title: string;
  description: string;
  image: string;
  price: number;
  salePrice?: number;
  discount?: number;
  quantity: number[];
  colors: string[];
}




const ProductSchema: Schema<IProduct> = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9\s.,'-]{3,100}$/, "Please enter a valid title."],
    },
    description: {
      type: String,
      required: true,
      match: [
        /^[a-zA-Z0-9\s.,'-]{1,1000}$/,
        "Please enter a valid description.",
      ],
    },
    image: { 
      type: String,
      match: [
        /\.(jpg|jpeg|png)$/i,
        "Image must be a .jpg, .jpeg, or .png file.",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number."],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price must be a positive number."],
    },
    discount: {
      type: Number,
      min: [0, "Discount must be a positive number."],
      max: [100, "Discount cannot exceed 100."],
    },
    quantity: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v: number[]) {
          return v.every((q) => q >= 1);
        },
        message: "All quantities must be at least 1.",
      },
    },
    colors: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: any) {
          if (typeof v === "string") {
            v = v.split(",").map((color) => color.trim());
          }
          return Array.isArray(v) && v.every((color) => /^[a-zA-Z\s]{3,30}$/.test(color));
        },
        message: "Each color must be 3 to 30 letters long and contain only letters or spaces.",
      },
    },
    
  },
  { timestamps: true }
);

ProductSchema.pre<IProduct>("save", function (next) {
  if (this.discount) {
    this.salePrice = this.price - this.price * (this.discount / 100);
  } else {
    this.salePrice = this.price;
  }
  next();
});

export const Product = model<IProduct>("Product", ProductSchema);
