import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const rootEnvPath = path.resolve(process.cwd(), '../.env');
const configPath = path.resolve(process.cwd(), '../config.json');

// Helper to update .env file
const updateEnvFile = (key, value) => {
    let envContent = '';

    if (fs.existsSync(rootEnvPath)) {
        envContent = fs.readFileSync(rootEnvPath, 'utf8');
    }

    const regex = new RegExp(`^${key}=.*`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
    } else {
        envContent += `\n${newLine}`;
    }

    fs.writeFileSync(rootEnvPath, envContent);
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
    const { githubUsername, adminPassword } = req.body;

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
