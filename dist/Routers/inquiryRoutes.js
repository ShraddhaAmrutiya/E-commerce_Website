"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inquiryController_1 = require("../Controllers/inquiryController");
const router = express_1.default.Router();
router.post("/", inquiryController_1.submitInquiry);
router.get("/", inquiryController_1.getInquiries);
exports.default = router;
