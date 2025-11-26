import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { validatePassword } from '../utils/validation.js';

const router = express.Router();
const envPath = path.resolve(process.cwd(), '.env');

// Helper to update .env file
const updateEnvFile = (key, value) => {
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    const regex = new RegExp(`^${key}=.*`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
    } else {
        envContent += `\n${newLine}`;
    }

    fs.writeFileSync(envPath, envContent);

    // Update current process env
    process.env[key] = value;
};

// GET /api/auth/status
// Check if admin password is set
router.get('/status', (req, res) => {
    const isSetup = !!process.env.ADMIN_PASSWORD;
    res.json({ isSetup });
});

// POST /api/auth/setup - Set admin password (only if not already set)
router.post('/setup', (req, res) => {
    if (process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ error: '管理员密码已设置' });
    }

    const { password } = req.body;

    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        updateEnvFile('ADMIN_PASSWORD', password);
        res.json({ success: true, message: '管理员密码设置成功' });
    } catch (error) {
        console.error('Error setting password:', error);
        res.status(500).json({ error: '设置密码失败' });
    }
});

// POST /api/auth/verify - Verify password
router.post('/verify', (req, res) => {
    const { password } = req.body;

    if (!process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ error: '尚未设置密钥' });
    }

    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: '密钥错误' });
    }
});

export default router;
