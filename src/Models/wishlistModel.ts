
import mongoose, { Schema, Document } from "mongoose";

interface IWishlistItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  products: IWishlistItem[];
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: true }
);

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [wishlistItemSchema],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
export default Wishlist;
