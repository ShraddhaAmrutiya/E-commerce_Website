import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors  from "cors";
import swaggerSpec from "./swagger/swagger";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import UserRoutes from './Routers/UserRouter'
import CategoryRoutes from './Routers/CategoryRoutes'
import ProductRoutes from './Routers/ProductRout'
import cartRoutes from './Routers/cartRoutes'
import orderRoute from './Routers/orderRoutes'
import chatbot from './Routers/chatboatRout'
import wishlistRoutes from './Routers/WishlistRoutes'
import cookieParser from "cookie-parser";


dotenv.config();
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"]; 

const app = express();
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200, 
    allowedHeaders: ["Content-Type", "Authorization", "token","userId"], 

  })
);app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173",
     methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
     credentials: true, 
     allowedHeaders: ["Content-Type", "Authorization", "token","userId"],  },
});

const uploadPath = path.join(process.cwd(), "uploads");
console.log("Serving uploads from:", uploadPath);
app.use("/uploads", express.static(uploadPath));
app.use(express.json());
// MongoDB Connection
mongoose.connect(process.env.URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(error));

// Swagger Authentication
const swaggerAuth = basicAuth({
  users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS },
  challenge: true,
});

// Serve Swagger Docs
app.use("/api-docs", swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Default Route (Fixes "Cannot GET /")
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the E-Commerce API with Live Chat!");
});

// Serve Static Files (For Chat Frontend)
app.use(express.static(path.join(__dirname, "../public")));

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Store username  when user joins
  socket.on("joinChat", (username ) => {
    users[socket.id] = username ;
    console.log(`User joined: ${username } (${socket.id})`);

    // Notify all users (including sender)
    io.emit("userJoined", `${username } joined the chat`);
  });

  // Handle messages
  socket.on("sendMessage", (data) => {
    const username  = users[socket.id] || "Unknown";
    console.log(`Message from ${username }: ${data.text}`);
    io.emit("receiveMessage", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const username  = users[socket.id] || "Unknown";
    console.log(`User disconnected: ${username } (${socket.id})`);
    
    // Notify all users
    io.emit("userLeft", `${username } left the chat`);

    delete users[socket.id]; // Remove user from list
  });
});
app.use('/uploads', (req, res, next) => {
  console.log("Serving:", req.path);
  next();
}, express.static('uploads'));


app.use('/users',UserRoutes);
app.use('/category',CategoryRoutes);
app.use('/products',ProductRoutes)
app.use('/cart',cartRoutes)
app.use('/order',orderRoute)
app.use('/chatbot',chatbot)
app.use("/wishlist", wishlistRoutes);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
