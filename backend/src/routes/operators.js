import express from 'express';
const router = express.Router();

// Mock database for operators
const operators = {
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
                description: '在场时，所有【辅助】干员的技力回复速度 +0.4/秒'
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

router.get('/:id', (req, res) => {
    const operator = operators[req.params.id];
    if (operator) {
        res.json(operator);
    } else {
        res.status(404).json({ message: '未找到干员档案' });
    }
});

export default router;
