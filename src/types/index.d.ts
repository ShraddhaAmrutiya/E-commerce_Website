// @types/express/index.d.ts
import { UserDocument } from "../Models/userModel"; // Import the User model's document type

declare global {
  namespace Express {
    interface Request { 
      user?: UserDocument;
      userId:string // Add 'user' to the Request type, which is optional
    }
  }
}
