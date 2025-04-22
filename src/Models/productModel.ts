import mongoose, { Schema, Document, model } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  image?: string;
  price: number;
  rating: number;
  description?: string;
  salePrice: number;
  category:  mongoose.Types.ObjectId | { _id: string; name: string };
  brand?: string;
  stock?: number;
  discountPercentage?: number;
  seller: mongoose.Types.ObjectId | { _id: string; name: string };
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true, // Automatically generates an _id
    },
    title: {
      type: String,
      // required: true,
      match: [/^[a-zA-Z0-9\s.,'-]{3,100}$/, "Please enter a valid title."],
    },
    description: {
      type: String,
      match: [
        /^[a-zA-Z0-9\s.,'-]{1,1000}$/,
        "Please enter a valid description.",
      ],
    },
    image: {
      type: String,
      match: [/\.(jpg|jpeg|png)$/i, "Image must be a .jpg, .jpeg, or .png file."],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number."],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price must be a positive number."],
      get: Math.floor,
      set: Math.floor
    },
  
    discountPercentage: {
      type: Number,
      min: [0, "Discount must be a positive number."],
      max: [100, "Discount cannot exceed 100."],
    },
    category: {
       type: Schema.Types.ObjectId, ref: "Category" 
    },
    brand: {
      type: String,
    },
    stock: {
      type: Number,
      min: [0, "Stock must be a non-negative number."],
    },
    rating: {
      type: Number,
      default: 0, // Ensures no undefined values
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Auto-calculate salePrice if discountPercentage exists
ProductSchema.pre<IProduct>("save", function (next) {
  if (this.discountPercentage) {
    this.salePrice = this.price - this.price * (this.discountPercentage / 100);
  } else {
    this.salePrice = this.price;
  }
  next();
});

export const Product = model<IProduct>("Product", ProductSchema);
