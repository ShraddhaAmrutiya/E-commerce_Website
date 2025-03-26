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
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const UserRouter_1 = __importDefault(require("./Routers/UserRouter"));
const CategoryRoutes_1 = __importDefault(require("./Routers/CategoryRoutes"));
const ProductRout_1 = __importDefault(require("./Routers/ProductRout"));
const cartRoutes_1 = __importDefault(require("./Routers/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./Routers/orderRoutes"));
const chatboatRout_1 = __importDefault(require("./Routers/chatboatRout"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:5173" }));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], credentials: true, },
});
const uploadPath = path_1.default.join(process.cwd(), "uploads");
console.log("Serving uploads from:", uploadPath);
app.use("/uploads", express_1.default.static(uploadPath));
app.use(express_1.default.json());
// MongoDB Connection
mongoose_1.default.connect(process.env.URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error(error));
// Swagger Authentication
const swaggerAuth = (0, express_basic_auth_1.default)({
    users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS },
    challenge: true,
});
// Serve Swagger Docs
app.use("/api-docs", swaggerAuth, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Default Route (Fixes "Cannot GET /")
app.get("/", (req, res) => {
    res.send("Welcome to the E-Commerce API with Live Chat!");
});
// Serve Static Files (For Chat Frontend)
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
const users = {};
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Store username when user joins
    socket.on("joinChat", (username) => {
        users[socket.id] = username;
        console.log(`User joined: ${username} (${socket.id})`);
        // Notify all users (including sender)
        io.emit("userJoined", `${username} joined the chat`);
    });
    // Handle messages
    socket.on("sendMessage", (data) => {
        const username = users[socket.id] || "Unknown";
        console.log(`Message from ${username}: ${data.text}`);
        io.emit("receiveMessage", data);
    });
    // Handle disconnection
    socket.on("disconnect", () => {
        const username = users[socket.id] || "Unknown";
        console.log(`User disconnected: ${username} (${socket.id})`);
        // Notify all users
        io.emit("userLeft", `${username} left the chat`);
        delete users[socket.id]; // Remove user from list
    });
});
app.use('/uploads', (req, res, next) => {
    console.log("Serving:", req.path);
    next();
}, express_1.default.static('uploads'));
app.use('/users', UserRouter_1.default);
app.use('/category', CategoryRoutes_1.default);
app.use('/products', ProductRout_1.default);
app.use('/cart', cartRoutes_1.default);
app.use('/order', orderRoutes_1.default);
app.use('/chatbot', chatboatRout_1.default);
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
});
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
