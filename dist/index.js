"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_1 = __importDefault(require("./swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const UserRouter_1 = __importDefault(require("./Routers/UserRouter"));
const CategoryRoutes_1 = __importDefault(require("./Routers/CategoryRoutes"));
const ProductRout_1 = __importDefault(require("./Routers/ProductRout"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
mongoose_1.default.connect(process.env.URI).then(() => console.log('connected to mongodb.')).catch((error) => console.error(error));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use('/users', UserRouter_1.default);
app.use('/categories', CategoryRoutes_1.default);
app.use('/products', ProductRout_1.default);
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(process.env.PORT, () => console.log(`server is running on port ${process.env.PORT}`));
