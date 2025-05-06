import mongoose, { Schema, Document, Types } from 'mongoose';

interface ICartProduct {
  productId: Types.ObjectId;  
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  products: ICartProduct[];
}

const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
});

export default mongoose.model<ICart>('Cart', CartSchema);
