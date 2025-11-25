import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './Operators.css';
import { Helmet } from 'react-helmet-async';

const Operators = () => {
    // Operators component for displaying character information - Force Recompile
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className="loading">加载档案中...</div>;
    if (error) return <div className="loading">错误: {error}<br />请确保后端服务器正在运行 (端口 3001)</div>;
    if (!data) return <div className="loading">未找到数据</div>;

    return (
        <div className="operator-file">
            <Helmet>
                <title>干员档案 | 罗德岛终端</title>
                <meta name="description" content="查看罗德岛干员的详细档案与作战数据。" />
            </Helmet>
            {/* Left: Portrait */}
            <div className="portrait-section">
                <div className="portrait-bg"></div>
                <img
                    src={data.portrait}
                    alt={data.name}
                    className="operator-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x800/1a1a1a/23ADE5?text=铃兰";
                    }}
                />
                <div className="operator-name-overlay">
                    <h1 className="en-name">{data.codename}</h1>
                    <h2 className="cn-name">{data.name.split(' ')[0]}</h2>
                </div>
            </div>

            {/* Right: Data Panel */}
            <div className="data-section">
                <div className="rhodes-card file-card">
                    {/* Header */}
                    <div className="file-header">
                        <div className="header-left">
                            <div className="class-icon">辅助干员</div>
                            <div className="rarity">{'★'.repeat(data.rarity)}</div>
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
                                {data.stats.map((stat, idx) => (
                                    <div key={idx} className="stat-row">
                                        <span className="stat-label">{stat.label}</span>
                                        <div className="stat-bar-container">
                                            <div
                                                className="stat-bar"
                                                style={{ width: `${(stat.value / stat.max) * 100}%` }}
                                            ></div>
                                            <div className="stat-bar-bg-deco"></div>
                                        </div>
                                        <span className="stat-val">{stat.value}</span>
                                    </div>
                                ))}

                                <div className="talents-box">
                                    <h3 className="section-title">天赋</h3>
                                    {data.talents.map((talent, idx) => (
                                        <div key={idx} className="talent-item">
                                            <div className="talent-icon">T{idx + 1}</div>
                                            <div className="talent-info">
                                                <div className="talent-name">{talent.name}</div>
                                                <div className="talent-desc">{talent.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="skills-list">
                                {data.skills.map((skill, idx) => (
                                    <div key={idx} className="skill-item">
                                        <div className="skill-rank-badge">专精 7</div>
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
                                        <div className="skill-deco-corner"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'lore' && (
                            <div className="lore-text">
                                <div className="classified-stamp">机密</div>
                                <p>{data.lore}</p>
                                <div className="lore-meta">
                                    <div className="meta-row">
                                        <span className="meta-label">种族</span>
                                        <span className="meta-val">{data.race}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">出身地</span>
                                        <span className="meta-val">{data.origin}</span>
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
