"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./swagger/swagger"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
// Import Routes
const UserRouter_1 = __importDefault(require("./Routers/UserRouter"));
const CategoryRoutes_1 = __importDefault(require("./Routers/CategoryRoutes"));
const ProductRout_1 = __importDefault(require("./Routers/ProductRout"));
const cartRoutes_1 = __importDefault(require("./Routers/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./Routers/orderRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.URI)
    .then(() => console.log('Connected to MongoDB.'))
    .catch((error) => console.error(error));
// ✅ Basic Authentication for Swagger
const adminAuth = (0, express_basic_auth_1.default)({
    users: { admin: 'Ax!0n@123' },
    challenge: true,
});
// ✅ Custom Styling for Swagger UI
const options = {
    customCss: `
    .swagger-ui .topbar {
      background-color: #efefef;
    }
    .swagger-ui .topbar .topbar-wrapper svg {
      display: none;
    }
    .swagger-ui .topbar .topbar-wrapper .link {
      display: inline-block;
      width: 175px;
      height: 65px;
      background-image: url("${process.env.REACT_APP_LINK}/logo.png");
      background-size: auto 100%;
      background-repeat: no-repeat;
    }`,
    customSiteTitle: 'Pepper PBX',
    customfavIcon: `${process.env.REACT_APP_LINK}/favicon.ico`,
};
// ✅ Secure Swagger UI
const swaggerHtmlV1 = swagger_ui_express_1.default.generateHTML(swagger_1.default, options);
app.use('/api-docs', adminAuth, swagger_ui_express_1.default.serveFiles(swagger_1.default), (req, res) => {
    res.send(swaggerHtmlV1);
});
// ✅ API Routes
app.use('/users', UserRouter_1.default);
app.use('/category', CategoryRoutes_1.default);
app.use('/products', ProductRout_1.default);
app.use('/cart', cartRoutes_1.default);
app.use('/order', orderRoutes_1.default);
// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong!' });
});
// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
