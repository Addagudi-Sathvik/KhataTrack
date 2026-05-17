import express from 'express';
import { uploadProfile, uploadReceipt } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.post('/profile', uploadImage.single('image'), uploadProfile);
router.post('/receipt', uploadImage.single('image'), uploadReceipt);

export default router;
