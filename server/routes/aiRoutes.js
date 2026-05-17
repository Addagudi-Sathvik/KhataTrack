import express from 'express';
import { chat, parseText, scanReceipt } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.post('/parse-text', parseText);
router.post('/chat', chat);
router.post('/scan-receipt', uploadImage.single('receipt'), scanReceipt);

export default router;
