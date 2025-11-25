import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './Home.css';
import { Helmet } from 'react-helmet-async';

const Home = () => {
    const [time, setTime] = useState(new Date());
    const [githubData, setGithubData] = useState({ public_repos: '-', followers: '-' });
    const [hitokoto, setHitokoto] = useState({ hitokoto: '加载中...', from: '' });

    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Default logs fallback
        const defaultLogs = [
            { id: 'sys-1', date: '2023-11-25', title: '系统升级 v2.0 完成', tag: '系统', isSystem: true },
            { id: 'sys-2', date: '2023-11-24', title: '新增干员数据: 铃兰', tag: '数据', isSystem: true },
            { id: 'sys-3', date: '2023-11-20', title: 'UI 优化计划', tag: '设计', isSystem: true }
        ];

        // Fetch GitHub Data
        axios.get(`${config.API_URL}/api/github/user`)
            .then(res => {
                setGithubData(res.data);
            })
            .catch(err => {
                console.error('GitHub API Error:', err);
            });

        // Fetch Recent Blogs
        axios.get(`${config.API_URL}/api/blogs?limit=3`)
            .then(res => {
                const blogPosts = res.data.posts.map(post => ({
                    id: post.id,
                    date: post.date,
                    title: post.title,
                    tag: post.tags && post.tags.length > 0 ? post.tags[0] : 'Blog',
                    isSystem: false
                }));

                // Merge: Use blog posts first, fill with default logs if needed
                const mergedLogs = [...blogPosts];
                if (mergedLogs.length < 3) {
                    const needed = 3 - mergedLogs.length;
                    mergedLogs.push(...defaultLogs.slice(0, needed));
                }
                setLogs(mergedLogs);
            })
            .catch(err => {
                console.error('Blog API Error:', err);
                setLogs(defaultLogs);
            });

        // Fetch Hitokoto
        axios.get('https://v1.hitokoto.cn/')
            .then(res => {
                setHitokoto(res.data);
            })
            .catch(err => {
                console.error('Hitokoto API Error:', err);
                setHitokoto({ hitokoto: '代码如诗，设计如画。追求极致的用户体验与优雅的代码实现。', from: '' });
            });

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="dashboard-grid">
            <Helmet>
                <title>罗德岛终端 | 首页</title>
                <meta name="description" content="罗德岛个人终端系统，提供干员数据、系统监控与博客功能。" />
            </Helmet>
            {/* Block A: User Profile */}
            <div className="rhodes-card profile-card">
                <div className="card-header">
                    <span className="text-mono">身份证</span>
                    <div className="deco-line"></div>
                </div>
                <div className="profile-content">
                    <div className="avatar-box">
                        <img
                            src={githubData.avatar_url || "https://prts.wiki/images/thumb/d/da/%E7%AB%8B%E7%BB%98_%E9%93%83%E5%85%B0_2.png/300px-%E7%AB%8B%E7%BB%98_%E9%93%83%E5%85%B0_2.png"}
                            alt="Avatar"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/300x300/1a1a1a/23ADE5?text=博士";
                            }}
                        />
                        <div className="scan-line"></div>
                    </div>
                    <div className="info-box">
                        <h1 className="text-h1">{githubData.login || '博士'}</h1>
                        <p className="text-mono text-gray">等级 120 | 罗德岛</p>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="val text-cyan">{githubData.public_repos}</span>
                                <span className="label">项目</span>
                            </div>
                            <div className="stat-item">
                                <span className="val text-orange">{githubData.followers}</span>
                                <span className="label">关注者</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block B: System Clock & Status */}
            <div className="rhodes-card system-card">
                <div className="clock-display">
                    <div className="time">{time.toLocaleTimeString('zh-CN', { hour12: false })}</div>
                    <div className="date text-mono">{time.toLocaleDateString('zh-CN').toUpperCase()}</div>
                </div>
                <div className="status-grid">
                    <div className="status-item">
                        <span className="label">处理器</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: '45%' }}></div></div>
                    </div>
                    <div className="status-item">
                        <span className="label">内存</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: '62%' }}></div></div>
                    </div>
                    <div className="status-item">
                        <span className="label">网络</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: '20%' }}></div></div>
                    </div>
                </div>
            </div>

            {/* Block C: Quick Actions */}
            <div className="rhodes-card actions-card">
                <h2 className="text-h2">快速访问</h2>
                <div className="action-buttons">
                    <Link to="/blog/new" className="rhodes-btn primary">
                        <span>+ 新博客</span>
                    </Link>
                    <Link to="/monitor" className="rhodes-btn">
                        <span>完整监控</span>
                    </Link>
                    <a href={githubData.html_url || "https://github.com"} target="_blank" rel="noopener noreferrer" className="rhodes-btn">
                        <span>GITHUB 仓库</span>
                    </a>
                </div>
            </div>

            {/* Block D: Recent Logs */}
            <div className="rhodes-card logs-card">
                <h2 className="text-h2">最近记录</h2>
                <ul className="log-list">
                    {logs.map((log, index) => (
                        <li className="log-item" key={log.id || index}>
                            <span className="date text-mono">{log.date}</span>
                            {log.isSystem ? (
                                <span className="title">{log.title}</span>
                            ) : (
                                <Link to={`/blog/${log.id}`} className="title" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {log.title}
                                </Link>
                            )}
                            <span className="tag">{log.tag}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Block E: Skills/Tech Stack */}
            <div className="rhodes-card skills-card">
                <h2 className="text-h2">技术栈</h2>
                <div className="skills-grid">
                    <div className="skill-tag">React</div>
                    <div className="skill-tag">Node.js</div>
                    <div className="skill-tag">Express</div>
                    <div className="skill-tag">MongoDB</div>
                    <div className="skill-tag">Socket.io</div>
                    <div className="skill-tag">Vite</div>
                    <div className="skill-tag">CSS3</div>
                    <div className="skill-tag">JavaScript</div>
                </div>
            </div>

            {/* Block F: Hitokoto Quote */}
            <div className="rhodes-card bio-card">
                <div className="quote-icon">❝</div>
                <p className="bio-text">
                    {hitokoto.hitokoto}
                </p>
                <div className="bio-meta">
                    <span className="text-mono text-gray">
                        — {hitokoto.from ? `《${hitokoto.from}》` : '一言'}
                    </span>
                </div>
            </div>

            {/* Block G: Contribution Stats */}
            <div className="rhodes-card contrib-card">
                <h2 className="text-h2">活动统计</h2>
                <div className="contrib-grid">
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '40%' }}></div>
                        <span className="contrib-label">周一</span>
                    </div>
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '70%' }}></div>
                        <span className="contrib-label">周二</span>
                    </div>
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '55%' }}></div>
                        <span className="contrib-label">周三</span>
                    </div>
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '85%' }}></div>
                        <span className="contrib-label">周四</span>
                    </div>
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '60%' }}></div>
                        <span className="contrib-label">周五</span>
                    </div>
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '30%' }}></div>
                        <span className="contrib-label">周六</span>
                    </div>
                    <div className="contrib-item">
                        <div className="contrib-bar" style={{ height: '20%' }}></div>
                        <span className="contrib-label">周日</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
