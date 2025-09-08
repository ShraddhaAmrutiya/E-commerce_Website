import cloudinary from "../cloudinary";
import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
