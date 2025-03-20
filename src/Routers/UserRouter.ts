import express from 'express';
import { registerUser, loginUser,forgotPassword ,resetPassword,logoutUser,getUser,getAllUsers,
    resetPasswordWithOldPassword
} from '../Controllers/UserController';
import authMiddleware from '../middleware/authMiddlewate'

const router = express.Router();



router.post('/register', registerUser);
 
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/', resetPassword);
router.post('/reset-passwordwitholdpassword/', resetPasswordWithOldPassword);

router.post('/logout', logoutUser);

router.get("/:id",authMiddleware, getUser);

router.get("/", getAllUsers);

export default router;
