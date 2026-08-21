import mongoose, { Schema, Document } from "mongoose";

export interface IGoogleReview extends Document {
  reviewId: string;
  placeId: string;
  businessName: string;
  reviewerName: string;
  rating: number;
  text: string;
  reviewUrl: string;
  businessUrl: string;
  lastSyncedAt: Date;
}

const GoogleReviewSchema = new Schema<IGoogleReview>(
  {
    reviewId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    placeId: {
      type: String,
      required: true,
      index: true,
    },

    businessName: {
      type: String,
      default: "",
    },

    reviewerName: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
    },

    text: {
      type: String,
      default: "",
    },

    reviewUrl: {
      type: String,
      required: true,
    },

    businessUrl: {
      type: String,
      default: "",
    },

    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IGoogleReview>("GoogleReview", GoogleReviewSchema);
