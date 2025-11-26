import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to config.json
const configPath = path.resolve(__dirname, '../../../config.json');

// Helper to read config.json
const readConfig = () => {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading config.json:', error);
    }
    return {};
};

// Helper to update config.json
const updateConfig = (data) => {
    try {
        const config = readConfig();
        const updatedConfig = { ...config, ...data };
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
        return updatedConfig;
    } catch (error) {
        console.error('Error updating config.json:', error);
        throw error;
    }
};

// GET /api/theme - Get current theme configuration (public, no auth required)
router.get('/', (req, res) => {
    try {
        const config = readConfig();
        const theme = config.theme || {
            activeTheme: 'arknights',
            customSchemes: {}
        };
        res.json(theme);
    } catch (error) {
        console.error('Error getting theme:', error);
        res.status(500).json({ error: '获取主题配置失败' });
    }
});

// PUT /api/theme/active - Switch active theme (admin only)
router.put('/active', authenticateAdmin, (req, res) => {
    try {
        const { activeTheme } = req.body;

        if (!activeTheme || typeof activeTheme !== 'string') {
            return res.status(400).json({ error: '无效的主题名称' });
        }

        const config = readConfig();
        const theme = config.theme || { customSchemes: {} };

        // Validate theme exists (for custom themes)
        if (activeTheme.startsWith('custom:')) {
            const schemeName = activeTheme.substring(7);
            if (!theme.customSchemes || !theme.customSchemes[schemeName]) {
                return res.status(400).json({ error: '自定义方案不存在' });
            }
        }

        // Update active theme
        theme.activeTheme = activeTheme;
        updateConfig({ theme });

        res.json({ success: true, activeTheme });
    } catch (error) {
        console.error('Error switching theme:', error);
        res.status(500).json({ error: '切换主题失败' });
    }
});

// POST /api/theme/scheme - Create or update custom color scheme (admin only)
router.post('/scheme', authenticateAdmin, (req, res) => {
    try {
        const { name, colors } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: '方案名称不能为空' });
        }

        if (!colors || typeof colors !== 'object') {
            return res.status(400).json({ error: '无效的配色数据' });
        }

        // Validate all required color fields are present
        const requiredFields = [
            'bg-black', 'bg-dark', 'bg-panel', 'border-color',
            'accent-primary', 'accent-secondary', 'text-primary', 'text-secondary'
        ];

        for (const field of requiredFields) {
            if (!colors[field]) {
                return res.status(400).json({ error: `缺少必需的颜色字段: ${field}` });
            }
        }

        const config = readConfig();
        const theme = config.theme || { activeTheme: 'arknights', customSchemes: {} };

        // Ensure customSchemes exists
        if (!theme.customSchemes) {
            theme.customSchemes = {};
        }

        // Save the scheme
        theme.customSchemes[name.trim()] = colors;
        updateConfig({ theme });

        res.json({ success: true, name: name.trim(), colors });
    } catch (error) {
        console.error('Error saving scheme:', error);
        res.status(500).json({ error: '保存配色方案失败' });
    }
});

// DELETE /api/theme/scheme/:name - Delete custom color scheme (admin only)
router.delete('/scheme/:name', authenticateAdmin, (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({ error: '方案名称不能为空' });
        }

        const config = readConfig();
        const theme = config.theme || { activeTheme: 'arknights', customSchemes: {} };

        if (!theme.customSchemes || !theme.customSchemes[name]) {
            return res.status(404).json({ error: '方案不存在' });
        }

        // Delete the scheme
        delete theme.customSchemes[name];

        // If the deleted scheme is currently active, switch to arknights
        if (theme.activeTheme === `custom:${name}`) {
            theme.activeTheme = 'arknights';
        }

        updateConfig({ theme });

        res.json({ success: true, message: '配色方案已删除' });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({ error: '删除配色方案失败' });
    }
});

export default router;
