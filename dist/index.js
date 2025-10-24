"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const swagger_1 = __importDefault(require("./swagger/swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const orderModel_1 = __importDefault(require("./Models/orderModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const UserRouter_1 = __importDefault(require("./Routers/UserRouter"));
const CategoryRoutes_1 = __importDefault(require("./Routers/CategoryRoutes"));
const ReviewRout_1 = __importDefault(require("./Routers/ReviewRout"));
const ProductRout_1 = __importDefault(require("./Routers/ProductRout"));
const cartRoutes_1 = __importDefault(require("./Routers/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./Routers/orderRoutes"));
const chatboatRout_1 = __importDefault(require("./Routers/chatboatRout"));
const WishlistRoutes_1 = __importDefault(require("./Routers/WishlistRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const i18n_1 = __importDefault(require("./i18n"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const languageMIddleware_1 = require("./middleware/languageMIddleware");
const googleapis_1 = require("googleapis");
const userModel_1 = require("./Models/userModel");
dotenv_1.default.config();
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "token",
        "userId",
        "userName",
        "Role",
    ],
}));
app.use((0, cookie_parser_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        credentials: true,
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "token",
            "userId",
            "userName",
            "Role",
        ],
    },
});
app.use(i18next_http_middleware_1.default.handle(i18n_1.default));
const uploadPath = path_1.default.join(process.cwd(), "uploads");
app.use("/uploads", express_1.default.static(uploadPath));
app.use(express_1.default.json());
mongoose_1.default
    .connect(process.env.URI)
    .then(() => {
    console.log("✅ Connected to MongoDB");
    // ------------------- Cron Job -------------------
    // cron.schedule("0 0 * * *", async () => {
    node_cron_1.default.schedule("* * * * *", async () => {
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const oldOrders = await orderModel_1.default.find({
                createdAt: { $lt: twoDaysAgo },
            }).populate("products.productId");
            if (!oldOrders.length) {
                console.log("ℹ No orders to backup or delete.");
                return;
            }
            const auth = new googleapis_1.google.auth.GoogleAuth({
                credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
                scopes: [
                    "https://www.googleapis.com/auth/spreadsheets",
                    "https://www.googleapis.com/auth/drive",
                ],
            });
            const sheets = googleapis_1.google.sheets({ version: "v4", auth });
            const spreadsheetId = "1VVDL3s_QiKJCuXLxEXSkNrGscw2pScMD4NzcUIlN4bo";
            // Check if sheet is empty to add header row
            const getResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "A1:F1",
            });
            if (!getResponse.data.values) {
                // Header row
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: "A1",
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [
                            [
                                "Order ID",
                                "User ID",
                                "User Name",
                                "Phone Number",
                                "Products",
                                "Total Price",
                                "Created At",
                            ],
                        ],
                    },
                });
            }
            const rows = await Promise.all(oldOrders.map(async (order) => {
                const user = await userModel_1.User.findById(order.userId);
                const productsStr = order.products
                    .map((p) => {
                    const product = p.productId;
                    return `${product._id} - ${product.title || "Unknown"} (qty: ${p.quantity})`;
                })
                    .join(", ");
                const userName = user ? user.userName : "Unknown";
                const phoneNumber = user ? user.phone : "Unknown";
                return [
                    order._id.toString(),
                    order.userId.toString(),
                    userName,
                    phoneNumber,
                    productsStr,
                    order.totalPrice,
                    order.status || "",
                    order.createdAt.toISOString(),
                ];
            }));
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: "A2", // append starting from second row
                valueInputOption: "RAW",
                insertDataOption: "INSERT_ROWS",
                requestBody: { values: rows },
            });
            console.log("📤 Orders backed up to Google Sheets!");
            const result = await orderModel_1.default.deleteMany({
                createdAt: { $lt: twoDaysAgo },
            });
            console.log(`🗑️ Deleted ${result.deletedCount} orders older than 2 days.`);
        }
        catch (err) {
            console.error("❌ Error in cron job:", err);
        }
    });
})
    .catch((error) => console.error("❌ MongoDB connection error:", error));
const swaggerAuth = (0, express_basic_auth_1.default)({
    users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS },
    challenge: true,
});
app.use("/api-docs", swaggerAuth, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get("/", (req, res) => {
    res.send("Welcome to the E-Commerce API with Live Chat!");
});
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
const users = {};
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("joinChat", (userName) => {
        users[socket.id] = userName;
        console.log(`User joined: ${userName} (${socket.id})`);
        io.emit("userJoined", `${userName} joined the chat`);
    });
    socket.on("sendMessage", (data) => {
        const userName = users[socket.id] || "Unknown";
        console.log(`Message from ${userName}: ${data.text}`);
        io.emit("receiveMessage", data);
    });
    socket.on("disconnect", () => {
        const userName = users[socket.id] || "Unknown";
        console.log(`User disconnected: ${userName} (${socket.id})`);
        io.emit("userLeft", `${userName} left the chat`);
        delete users[socket.id];
    });
});
app.use("/uploads", (req, res, next) => {
    next();
}, express_1.default.static("uploads"));
app.use(languageMIddleware_1.languageMiddleware);
app.get("/test-lang", (req, res) => {
    res.json({
        lang: req.language,
        message: req.t("product.productsInCategory", { category: "पुस्तकें" }),
    });
});
app.use("/users", UserRouter_1.default);
app.use("/category", CategoryRoutes_1.default);
app.use("/reviews", ReviewRout_1.default);
app.use("/products", ProductRout_1.default);
app.use("/cart", cartRoutes_1.default);
app.use("/order", orderRoutes_1.default);
app.use("/chatbot", chatboatRout_1.default);
app.use("/wishlist", WishlistRoutes_1.default);
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
});
// Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
