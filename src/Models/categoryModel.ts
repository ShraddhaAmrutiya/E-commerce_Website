import mongoose, { Schema, Document,model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      match: [/^[a-zA-Z._\s-]{3,20}$/, "Please enter a valid user name."],
    },
    description: {
      type: String,
      match: [
        /^[a-zA-Z0-9\s.,'-]{1,1000}$/,
        "Please enter a valid description.",
      ],
    },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", CategorySchema);
