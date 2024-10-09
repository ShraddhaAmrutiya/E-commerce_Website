import express, { Request, Response, NextFunction } from 'express';
import swaggerSpec  from './swagger';
import swaggerUi from 'swagger-ui-express';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import UserRoutes from './Routers/UserRouter'
import CategoryRoutes from './Routers/CategoryRoutes'
import ProductRoutes from './Routers/ProductRout'
const app=express()
app.use(express.json())

mongoose.connect(process.env.URI as string).then(()=> console.log('connected to mongodb.')
).catch((error)=>console.error(error)
)


  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
  
  app.use('/users',UserRoutes);
app.use('/categories',CategoryRoutes);
app.use('/products',ProductRoutes)


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  
    res.status(500).json({ error: 'Something went wrong!' });
  });
app.listen(process.env.PORT,()=>console.log(`server is running on port ${process.env.PORT}`)
)