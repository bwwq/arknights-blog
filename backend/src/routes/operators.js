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

// Initialize operators data in config if not exists
const initializeOperators = () => {
    const config = readConfig();
    if (!config.operators) {
        // Migrate suzuran data to config
        config.operators = {
            suzuran: {
                id: 'suzuran',
                name: '铃兰',
                codename: 'LISA',
                class: '辅助',
                subclass: '凝滞师',
                rarity: 6,
                portrait: 'https://img.j8.je/images/2025/11/21/T6Bf.png',
                stats: [
                    { label: '生命', value: 1480, max: 2000 },
                    { label: '攻击', value: 596, max: 1000 },
                    { label: '防御', value: 128, max: 500 },
                    { label: '法抗', value: 25, max: 100 },
                    { label: '费用', value: 16, max: 20 },
                    { label: '阻挡', value: 1, max: 3 }
                ],
                talents: [
                    {
                        name: '技力光环·辅助',
                        description: '在场时,所有【辅助】干员的技力回复速度 +0.4/秒'
                    },
                    {
                        name: '画地为牢',
                        description: '攻击范围内被停顿的敌人，受到伤害时获得脆弱效果（受到伤害 +20%）'
                    }
                ],
                skills: [
                    {
                        name: "全力以赴",
                        sp: 30,
                        type: '自动回复',
                        duration: 30,
                        description: '攻击力 +80%，攻击速度 +30'
                    },
                    {
                        name: '儿时的玩伴',
                        sp: 80,
                        type: '自动回复',
                        duration: '∞',
                        description: '攻击力 +60%，同时攻击 3 个目标。持续时间无限。'
                    },
                    {
                        name: '狐火渺然',
                        sp: 70,
                        type: '自动回复',
                        duration: 35,
                        description: '停止攻击；攻击范围扩大；攻击范围内所有敌人被停顿，并获得脆弱效果（受到伤害 +40%）；攻击范围内所有友方单位每秒恢复相当于铃兰攻击力 20% 的生命'
                    }
                ],
                lore: '铃兰，本名丽萨，九尾狐族，来自东国。目前在罗德岛接受治疗，同时在战场上提供支援。尽管年纪尚小，但她表现出了超越年龄的成熟。她的源石技艺可以治愈盟友，并用神秘的狐火阻碍敌人。',
                race: '沃尔珀',
                origin: '东国'
            }
        };
        config.activeOperator = 'suzuran';
        updateConfig(config);
    }
};

// Initialize on module load
initializeOperators();

// GET /api/operators/:id - Get operator data
router.get('/:id', (req, res) => {
    try {
        const config = readConfig();
        const operator = config.operators?.[req.params.id];

        if (operator) {
            // Backwards compatibility: Ensure fields exist
            const defaults = {
                class: '辅助',
                rarity: 6,
                stats: [],
                skills: [],
                talents: [],
                lore: '暂无档案',
                race: '未知',
                origin: '未知'
            };
            res.json({ ...defaults, ...operator });
        } else {
            res.status(404).json({ message: '未找到干员档案' });
        }
    } catch (error) {
        console.error('Error fetching operator:', error);
        res.status(500).json({ error: '获取干员数据失败' });
    }
});

// PUT /api/operators/:id - Update operator data (admin only)
router.put('/:id', authenticateAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const operatorData = req.body;

        // Validation
        if (!operatorData.name || !operatorData.codename) {
            return res.status(400).json({ error: '名称和代号不能为空' });
        }

        const config = readConfig();
        if (!config.operators) {
            config.operators = {};
        }

        // Ensure id is consistent
        operatorData.id = id;
        config.operators[id] = operatorData;

        updateConfig(config);
        res.json({ success: true, operator: operatorData });
    } catch (error) {
        console.error('Error updating operator:', error);
        res.status(500).json({ error: '更新干员数据失败' });
    }
});

// POST /api/operators - Create new operator (admin only)
router.post('/', authenticateAdmin, (req, res) => {
    try {
        const { id, ...operatorData } = req.body;

        // Validation
        if (!id || !operatorData.name || !operatorData.codename) {
            return res.status(400).json({ error: 'ID、名称和代号不能为空' });
        }

        const config = readConfig();
        if (!config.operators) {
            config.operators = {};
        }

        // Check if id already exists
        if (config.operators[id]) {
            return res.status(409).json({ error: '该ID已存在' });
        }

        operatorData.id = id;
        config.operators[id] = operatorData;

        updateConfig(config);
        res.json({ success: true, operator: operatorData });
    } catch (error) {
        console.error('Error creating operator:', error);
        res.status(500).json({ error: '创建干员失败' });
    }
});

// DELETE /api/operators/:id - Delete operator (admin only)
router.delete('/:id', authenticateAdmin, (req, res) => {
    try {
        const { id } = req.params;

        const config = readConfig();
        if (!config.operators || !config.operators[id]) {
            return res.status(404).json({ error: '角色不存在' });
        }

        delete config.operators[id];

        // If deleted operator was active, switch to first available or null
        if (config.activeOperator === id) {
            const remainingIds = Object.keys(config.operators);
            config.activeOperator = remainingIds.length > 0 ? remainingIds[0] : null;
        }

        updateConfig(config);
        res.json({ success: true, message: '角色已删除' });
    } catch (error) {
        console.error('Error deleting operator:', error);
        res.status(500).json({ error: '删除角色失败' });
    }
});

export default router;
