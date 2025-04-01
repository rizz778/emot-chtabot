import express from "express";
import { upload } from '../config/cloudinary.js';
import {
    saveUserProfile, 
  getUserProfile, 
  uploadProfilePicture, 
  deleteProfilePicture 

} from "../controllers/userController.js"
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

// Profile routes
router.get('/', getUserProfile);
router.post('/', saveUserProfile);
router.post('/upload-picture', upload.single('profilePicture'), uploadProfilePicture);
router.delete('/delete-picture', deleteProfilePicture);

export default router;
