import express from 'express';
import multer from 'multer';
import { extractTradeFromImage } from '../utils/ocrTradeExtractor.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const trade = await extractTradeFromImage(req.file.buffer);
    res.json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;