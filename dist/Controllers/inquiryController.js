"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInquiries = exports.submitInquiry = void 0;
const inquiryModel_1 = __importDefault(require("../Models/inquiryModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const submitInquiry = async (req, res) => {
    try {
        const { name, email, phone, message, productId } = req.body;
        const newInquiry = new inquiryModel_1.default({
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
                }
                else {
                    console.log("Email sent: " + info.response);
                }
            });
        }
        res.status(201).json({ message: "Inquiry submitted successfully", inquiry: newInquiry });
    }
    catch (error) {
        console.error("Error submitting inquiry:", error);
        res.status(500).json({ message: "Failed to submit inquiry", error });
    }
};
exports.submitInquiry = submitInquiry;
const getInquiries = async (req, res) => {
    try {
        const inquiries = await inquiryModel_1.default.find().populate("productId").sort({ createdAt: -1 });
        res.status(200).json({ inquiries });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch inquiries", error });
    }
};
exports.getInquiries = getInquiries;
