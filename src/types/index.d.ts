// @types/express/index.d.ts
import { UserDocument } from "../Models/userModel"; 

declare global {
  namespace Express {
    interface Request { 
      user?: UserDocument;
      userId:string ;
      language?: string;
    }
  }
}
