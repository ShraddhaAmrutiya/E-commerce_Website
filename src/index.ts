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
import ReviewRoutes from './Routers/ReviewRout'
import ProductRoutes from './Routers/ProductRout'
import cartRoutes from './Routers/cartRoutes'
import orderRoute from './Routers/orderRoutes'
import chatbot from './Routers/chatboatRout'
import wishlistRoutes from './Routers/WishlistRoutes'
import cookieParser from "cookie-parser";
import i18n from './i18n';
import i18nextMiddleware from 'i18next-http-middleware';
import { languageMiddleware } from "./middleware/languageMIddleware";

dotenv.config();
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"]; 

const app = express();
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200, 
    allowedHeaders: ["Content-Type", "Authorization", "token","userId","userName", "Role"], 

  })
);app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173",
     methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
     credentials: true, 
     allowedHeaders: ["Content-Type", "Authorization", "token","userId","userName","Role"],  },
});
app.use(i18nextMiddleware.handle(i18n));


const uploadPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadPath));
app.use(express.json());
mongoose.connect(process.env.URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(error));
  console.log("✅ Connected to MongoDB:"); 

const swaggerAuth = basicAuth({
  users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS },
  challenge: true,
});

app.use("/api-docs", swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the E-Commerce API with Live Chat!");
});

app.use(express.static(path.join(__dirname, "../public")));

const users = {};


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChat", (userName ) => {
    users[socket.id] = userName ;
    console.log(`User joined: ${userName } (${socket.id})`);

    io.emit("userJoined", `${userName } joined the chat`);
  });

  socket.on("sendMessage", (data) => {
    const userName  = users[socket.id] || "Unknown";
    console.log(`Message from ${userName }: ${data.text}`);
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    const userName  = users[socket.id] || "Unknown";
    console.log(`User disconnected: ${userName } (${socket.id})`);
    
    io.emit("userLeft", `${userName } left the chat`);

    delete users[socket.id]; 
  });
});
app.use('/uploads', (req, res, next) => {
  next();
}, express.static('uploads'));

app.use(languageMiddleware)

app.get("/test-lang", (req: Request, res: Response) => {
  res.json({
    lang: req.language,
    message: req.t("product.productsInCategory", { category: "पुस्तकें" })
  });
});

app.use('/users',UserRoutes);
app.use('/category',CategoryRoutes);
app.use('/reviews',ReviewRoutes);
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
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
