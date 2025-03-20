import express, { Request, Response, NextFunction } from 'express';
import swaggerSpec  from './swagger/swagger';
import swaggerUi from 'swagger-ui-express';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import UserRoutes from './Routers/UserRouter'
import CategoryRoutes from './Routers/CategoryRoutes'
import ProductRoutes from './Routers/ProductRout'
import cartRoutes from './Routers/cartRoutes'
import orderRoute from './Routers/orderRoutes'

const app=express()
app.use(express.json())

mongoose.connect(process.env.URI as string).then(()=> console.log('connected to mongodb.')
).catch((error)=>console.error(error)
)


  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
  
  app.use('/users',UserRoutes);
app.use('/category',CategoryRoutes);
app.use('/products',ProductRoutes)
app.use('/cart',cartRoutes)
app.use('/order',orderRoute)



app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  
    res.status(500).json({ error: 'Something went wrong!' });
  });
app.listen(process.env.PORT,()=>console.log(`server is running on port ${process.env.PORT}`)
)