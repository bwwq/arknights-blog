import express from 'express';
import fs from 'fs';
import path from 'path';
import requireAuth from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// POST /api/upload (PROTECTED)
// Expects JSON body: { image: "base64string...", name: "filename.png" }
router.post('/', requireAuth, (req, res) => {
    try {
        const { image, name } = req.body;

        if (!image) {
            return res.status(400).json({ error: '未提供图片数据' });
        }

        // Strip base64 header if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const ext = path.extname(name) || '.png';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        const filePath = path.join(uploadDir, filename);

        // Write file
        fs.writeFileSync(filePath, buffer);

        // Return URL
        const fileUrl = `/uploads/${filename}`;
        res.json({ url: fileUrl });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: '图片上传失败' });
    }
});

export default router;
