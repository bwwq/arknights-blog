import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Calculate paths relative to this file (backend/src/routes/setup.js)
// We want to reach d:/boke/.env and d:/boke/config.json
const rootEnvPath = path.resolve(__dirname, '../../../.env');
const configPath = path.resolve(__dirname, '../../../config.json');

console.log('Setup paths:', { rootEnvPath, configPath });

// Helper to update .env file
const updateEnvFile = (key, value) => {
    let envContent = '';

    try {
        if (fs.existsSync(rootEnvPath)) {
            envContent = fs.readFileSync(rootEnvPath, 'utf8');
        }

        // Ensure content ends with newline if not empty
        if (envContent && !envContent.endsWith('\n')) {
            envContent += '\n';
        }

        const regex = new RegExp(`^${key}=.*`, 'm');
        const newLine = `${key}=${value}`;

        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, newLine);
        } else {
            envContent += `${newLine}\n`;
        }

        fs.writeFileSync(rootEnvPath, envContent);
        console.log(`Updated .env: ${key}=***`);
    } catch (err) {
        console.error(`Failed to update .env for ${key}:`, err);
        throw err; // Re-throw to be caught by main handler
    }
};

// Helper to update config.json
const updateConfig = (data) => {
    let config = {};

    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    const updatedConfig = { ...config, ...data };
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

    return updatedConfig;
};

// GET /api/setup/status - Check if system is initialized
router.get('/status', (req, res) => {
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            res.json({
                isInitialized: config.isInitialized || false,
                githubUsername: config.githubUsername || ''
            });
        } else {
            res.json({ isInitialized: false });
        }
    } catch (error) {
        console.error('Error checking setup status:', error);
        res.json({ isInitialized: false });
    }
});

// POST /api/setup/initialize - Initialize system
router.post('/initialize', (req, res) => {
    const { githubUsername, adminPassword, githubToken } = req.body;

    // Validation
    if (!githubUsername || !githubUsername.trim()) {
        return res.status(400).json({ error: 'GitHub 用户名不能为空' });
    }

    if (!adminPassword || adminPassword.length < 6) {
        return res.status(400).json({ error: '密码长度至少需要 6 位' });
    }

    try {
        // Check if already initialized
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.isInitialized) {
                return res.status(400).json({ error: '系统已经初始化' });
            }
        }

        // Update .env file with admin password
        updateEnvFile('ADMIN_PASSWORD', adminPassword);

        // Update GitHub Token if provided
        if (githubToken && githubToken.trim()) {
            updateEnvFile('GITHUB_TOKEN', githubToken.trim());
            process.env.GITHUB_TOKEN = githubToken.trim();
        }

        // Update process.env
        process.env.ADMIN_PASSWORD = adminPassword;

        // Update config.json
        const config = updateConfig({
            isInitialized: true,
            githubUsername: githubUsername.trim(),
            initializedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: '系统初始化成功',
            config: {
                githubUsername: config.githubUsername
            }
        });
    } catch (error) {
        console.error('Error initializing system:', error);
        res.status(500).json({ error: '初始化失败，请重试' });
    }
});

export default router;
