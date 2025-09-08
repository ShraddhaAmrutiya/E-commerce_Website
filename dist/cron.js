"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const orderModel_1 = __importDefault(require("./Models/orderModel")); // adjust path as needed
// This runs every day at midnight
node_cron_1.default.schedule("* * * * *", async () => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const result = await orderModel_1.default.deleteMany({
            createdAt: { $lt: twoDaysAgo },
        });
        if (result.deletedCount > 0) {
            console.log(`🗑️ Deleted ${result.deletedCount} orders older than 2 days.`);
        }
        else {
            console.log("ℹ️ No orders older than 2 days to delete.");
        }
    }
    catch (err) {
        console.error("❌ Error deleting old orders:", err);
    }
});
