import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './Operators.css';
import './Operators.edit.css';
import { Helmet } from 'react-helmet-async';

const Operators = () => {
    const [data, setData] = useState(null);
    const [editData, setEditData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    useEffect(() => {
        console.log('正在获取干员数据...');
        axios.get(`${config.API_URL}/api/operators/suzuran`)
            .then(res => {
                console.log('已接收数据:', res.data);
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('获取数据失败:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Enter edit mode
    const handleEdit = () => {
        setEditData(JSON.parse(JSON.stringify(data))); // Deep copy
        setIsEditing(true);
    };

    // Cancel edit
    const handleCancel = () => {
        if (window.confirm('取消编辑将丢失所有未保存的更改，确定吗？')) {
            setIsEditing(false);
            setEditData(null);
        }
    };

    // Save changes
    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.put(
                `${config.API_URL}/api/operators/suzuran`,
                editData,
                {
                    headers: {
                        'x-admin-password': localStorage.getItem('admin_password')
                    }
                }
            );

            if (response.data.success) {
                setData(editData);
                setIsEditing(false);
                setEditData(null);
                toast.success('干员档案已更新');
            }
        } catch (error) {
            console.error('保存失败:', error);
            const status = error.response?.status;
            const errorMsg = error.response?.data?.error || error.message;

            if (status === 401) {
                toast.error('保存失败: 密码错误或未登录 (401)');
            } else if (status === 500) {
                toast.error('保存失败: 服务器内部错误 (500)');
            } else {
                toast.error(`保存失败: ${errorMsg}`);
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle portrait upload
    const handlePortraitUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(
                `${config.API_URL}/api/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'x-admin-password': localStorage.getItem('admin_password')
                    }
                }
            );

            if (response.data.url) {
                setEditData({ ...editData, portrait: response.data.url });
                toast.success('立绘已上传');
            }
        } catch (error) {
            console.error('上传失败:', error);
            toast.error('上传失败');
        }
    };

    // Update stat value
    const handleStatChange = (index, value) => {
        const newStats = [...editData.stats];
        newStats[index].value = Math.min(Math.max(0, value), newStats[index].max);
        setEditData({ ...editData, stats: newStats });
    };

    // Add skill
    const handleAddSkill = () => {
        const newSkill = {
            name: '新技能',
            sp: 0,
            type: '自动回复',
            duration: 0,
            description: '技能描述'
        };
        setEditData({ ...editData, skills: [...editData.skills, newSkill] });
    };

    // Delete skill
    const handleDeleteSkill = (index) => {
        if (editData.skills.length <= 1) {
            toast.warning('至少保留一个技能');
            return;
        }
        const newSkills = editData.skills.filter((_, i) => i !== index);
        setEditData({ ...editData, skills: newSkills });
    };

    // Add talent
    const handleAddTalent = () => {
        const newTalent = {
            name: '新天赋',
            description: '天赋描述'
        };
        setEditData({ ...editData, talents: [...editData.talents, newTalent] });
    };

    // Delete talent
    const handleDeleteTalent = (index) => {
        if (editData.talents.length <= 1) {
            toast.warning('至少保留一个天赋');
            return;
        }
        const newTalents = editData.talents.filter((_, i) => i !== index);
        setEditData({ ...editData, talents: newTalents });
    };

    if (loading) return <div className="loading">加载档案中...</div>;
    if (error) return <div className="loading">错误: {error}<br />请确保后端服务器正在运行 (端口 3001)</div>;
    if (!data) return <div className="loading">未找到数据</div>;

    const currentData = isEditing ? editData : data;

    return (
        <div className="operator-file">
            <Helmet>
                <title>干员档案 | 罗德岛终端</title>
                <meta name="description" content="查看罗德岛干员的详细档案与作战数据。" />
            </Helmet>

            {/* Admin Actions */}
            {isAuthenticated && (
                <div className="operator-actions">
                    {!isEditing ? (
                        <button className="rhodes-btn primary" onClick={handleEdit}>
                            ✏️ 编辑档案
                        </button>
                    ) : (
                        <>
                            <button
                                className="rhodes-btn primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? '保存中...' : '💾 保存更改'}
                            </button>
                            <button
                                className="rhodes-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                ❌ 取消
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Left: Portrait */}
            <div className="portrait-section">
                <div className="portrait-bg"></div>
                <img
                    src={currentData.portrait}
                    alt={currentData.name}
                    className="operator-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x800/1a1a1a/23ADE5?text=铃兰";
                    }}
                />

                {/* Upload Portrait Button (Edit Mode) */}
                {isEditing && (
                    <div className="portrait-upload-overlay">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePortraitUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="rhodes-btn upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📸 更换立绘
                        </button>
                    </div>
                )}

                <div className="operator-name-overlay">
                    {isEditing ? (
                        <>
                            <input
                                className="rhodes-input name-input en-name"
                                value={editData.codename}
                                onChange={(e) => setEditData({ ...editData, codename: e.target.value })}
                                placeholder="代号(英文)"
                            />
                            <input
                                className="rhodes-input name-input cn-name"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="名称(中文)"
                            />
                        </>
                    ) : (
                        <>
                            <h1 className="en-name">{currentData.codename}</h1>
                            <h2 className="cn-name">{currentData.name.split(' ')[0]}</h2>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Data Panel */}
            <div className="data-section">
                <div className="rhodes-card file-card">
                    {/* Header */}
                    <div className="file-header">
                        <div className="header-left">
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        className="rhodes-input"
                                        style={{ width: '100px', fontSize: '16px', fontWeight: 'bold' }}
                                        value={editData.class}
                                        onChange={(e) => setEditData({ ...editData, class: e.target.value })}
                                        placeholder="职业"
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ color: '#FFD700' }}>★</span>
                                        <input
                                            type="number"
                                            className="rhodes-input"
                                            style={{ width: '60px' }}
                                            value={editData.rarity}
                                            onChange={(e) => setEditData({ ...editData, rarity: Math.min(6, Math.max(1, parseInt(e.target.value) || 1)) })}
                                            min="1" max="6"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="class-icon">{currentData.class}</div>
                                    <div className="rarity">{'★'.repeat(currentData.rarity)}</div>
                                </>
                            )}
                        </div>
                        <div className="header-right">
                            <div className="trust-badge">
                                <span className="label">信赖</span>
                                <span className="val">200%</span>
                            </div>
                            <div className="potential-badge">
                                <span className="label">潜能</span>
                                <div className="pot-icon">6</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="file-tabs">
                        {['stats', 'skills', 'lore'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'stats' ? '基础信息' : tab === 'skills' ? '技能' : '档案'}
                                <div className="tab-deco"></div>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="file-content">
                        {activeTab === 'stats' && (
                            <div className="stats-grid">
                                <div className="stats-radar-placeholder">
                                    {/* CSS-only Hexagon Radar would go here, using bars for now */}
                                    <div className="radar-label">体检报告</div>
                                </div>
                                {currentData.stats.map((stat, idx) => (
                                    <div key={idx} className="stat-row">
                                        <span className="stat-label">{stat.label}</span>
                                        <div className="stat-bar-container">
                                            <div
                                                className="stat-bar"
                                                style={{ width: `${(stat.value / stat.max) * 100}%` }}
                                            ></div>
                                            <div className="stat-bar-bg-deco"></div>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className="rhodes-input stat-input"
                                                value={editData.stats[idx].value}
                                                onChange={(e) => handleStatChange(idx, parseInt(e.target.value) || 0)}
                                                min="0"
                                                max={stat.max}
                                            />
                                        ) : (
                                            <span className="stat-val">{stat.value}</span>
                                        )}
                                    </div>
                                ))}

                                <div className="talents-box">
                                    <div className="section-header">
                                        <h3 className="section-title">天赋</h3>
                                        {isEditing && (
                                            <button className="rhodes-btn add-btn" onClick={handleAddTalent}>
                                                + 添加天赋
                                            </button>
                                        )}
                                    </div>
                                    {currentData.talents.map((talent, idx) => (
                                        <div key={idx} className="talent-item">
                                            {isEditing && (
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteTalent(idx)}
                                                    title="删除天赋"
                                                >
                                                    ×
                                                </button>
                                            )}
                                            <div className="talent-icon">T{idx + 1}</div>
                                            <div className="talent-info">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            className="rhodes-input talent-name-input"
                                                            value={editData.talents[idx].name}
                                                            onChange={(e) => {
                                                                const newTalents = [...editData.talents];
                                                                newTalents[idx].name = e.target.value;
                                                                setEditData({ ...editData, talents: newTalents });
                                                            }}
                                                            placeholder="天赋名称"
                                                        />
                                                        <textarea
                                                            className="rhodes-input talent-desc-input"
                                                            value={editData.talents[idx].description}
                                                            onChange={(e) => {
                                                                const newTalents = [...editData.talents];
                                                                newTalents[idx].description = e.target.value;
                                                                setEditData({ ...editData, talents: newTalents });
                                                            }}
                                                            placeholder="天赋描述"
                                                            rows="2"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="talent-name">{talent.name}</div>
                                                        <div className="talent-desc">{talent.description}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="skills-list">
                                {isEditing && (
                                    <button className="rhodes-btn add-skill-btn" onClick={handleAddSkill}>
                                        + 添加技能
                                    </button>
                                )}
                                {currentData.skills.map((skill, idx) => (
                                    <div key={idx} className="skill-item">
                                        {isEditing && (
                                            <button
                                                className="delete-btn skill-delete"
                                                onClick={() => handleDeleteSkill(idx)}
                                                title="删除技能"
                                            >
                                                ×
                                            </button>
                                        )}
                                        <div className="skill-rank-badge">专精 7</div>
                                        {isEditing ? (
                                            <>
                                                <div className="skill-header">
                                                    <input
                                                        className="rhodes-input skill-name-input"
                                                        value={editData.skills[idx].name}
                                                        onChange={(e) => {
                                                            const newSkills = [...editData.skills];
                                                            newSkills[idx].name = e.target.value;
                                                            setEditData({ ...editData, skills: newSkills });
                                                        }}
                                                        placeholder="技能名称"
                                                    />
                                                    <input
                                                        type="number"
                                                        className="rhodes-input skill-sp-input"
                                                        value={editData.skills[idx].sp}
                                                        onChange={(e) => {
                                                            const newSkills = [...editData.skills];
                                                            newSkills[idx].sp = parseInt(e.target.value) || 0;
                                                            setEditData({ ...editData, skills: newSkills });
                                                        }}
                                                        placeholder="技力"
                                                    />
                                                </div>
                                                <div className="skill-tags">
                                                    <input
                                                        className="rhodes-input skill-type-input"
                                                        value={editData.skills[idx].type}
                                                        onChange={(e) => {
                                                            const newSkills = [...editData.skills];
                                                            newSkills[idx].type = e.target.value;
                                                            setEditData({ ...editData, skills: newSkills });
                                                        }}
                                                        placeholder="回复类型"
                                                    />
                                                    <input
                                                        className="rhodes-input skill-duration-input"
                                                        value={editData.skills[idx].duration}
                                                        onChange={(e) => {
                                                            const newSkills = [...editData.skills];
                                                            newSkills[idx].duration = e.target.value;
                                                            setEditData({ ...editData, skills: newSkills });
                                                        }}
                                                        placeholder="持续时间"
                                                    />
                                                </div>
                                                <textarea
                                                    className="rhodes-input skill-desc-input"
                                                    value={editData.skills[idx].description}
                                                    onChange={(e) => {
                                                        const newSkills = [...editData.skills];
                                                        newSkills[idx].description = e.target.value;
                                                        setEditData({ ...editData, skills: newSkills });
                                                    }}
                                                    placeholder="技能描述"
                                                    rows="3"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <div className="skill-header">
                                                    <span className="skill-name">{skill.name}</span>
                                                    <span className="skill-sp">
                                                        <span className="sp-label">技力</span> {skill.sp}
                                                    </span>
                                                </div>
                                                <div className="skill-tags">
                                                    <span className="skill-tag type">{skill.type}</span>
                                                    <span className="skill-tag duration">{skill.duration === '∞' ? '无限' : `${skill.duration}秒`}</span>
                                                </div>
                                                <p className="skill-desc">{skill.description}</p>
                                            </>
                                        )}
                                        <div className="skill-deco-corner"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'lore' && (
                            <div className="lore-text">
                                <div className="classified-stamp">机密</div>
                                {isEditing ? (
                                    <textarea
                                        className="rhodes-input lore-input"
                                        value={editData.lore}
                                        onChange={(e) => setEditData({ ...editData, lore: e.target.value })}
                                        placeholder="档案文本"
                                        rows="8"
                                    />
                                ) : (
                                    <p>{currentData.lore}</p>
                                )}
                                <div className="lore-meta">
                                    <div className="meta-row">
                                        <span className="meta-label">种族</span>
                                        {isEditing ? (
                                            <input
                                                className="rhodes-input meta-input"
                                                value={editData.race}
                                                onChange={(e) => setEditData({ ...editData, race: e.target.value })}
                                                placeholder="种族"
                                            />
                                        ) : (
                                            <span className="meta-val">{currentData.race}</span>
                                        )}
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">出身地</span>
                                        {isEditing ? (
                                            <input
                                                className="rhodes-input meta-input"
                                                value={editData.origin}
                                                onChange={(e) => setEditData({ ...editData, origin: e.target.value })}
                                                placeholder="出身地"
                                            />
                                        ) : (
                                            <span className="meta-val">{currentData.origin}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Operators;
