import { Request, Response } from "express";
import Inquiry from "../Models/inquiryModel";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message, productId } = req.body;

    const newInquiry = new Inquiry({
      name,
      email,
      phone,
      message,
      productId,
    });

    await newInquiry.save();

    // Send email notification to admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `New Product Inquiry from ${name}`,
        html: `
          <h3>New Inquiry Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Product ID:</strong> ${productId || "General Inquiry"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    res.status(201).json({ message: "Inquiry submitted successfully", inquiry: newInquiry });
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    res.status(500).json({ message: "Failed to submit inquiry", error });
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const inquiries = await Inquiry.find().populate("productId").sort({ createdAt: -1 });
    res.status(200).json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inquiries", error });
  }
};
