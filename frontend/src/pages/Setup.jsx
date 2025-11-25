import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './Setup.css';
import { Helmet } from 'react-helmet-async';

const Setup = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        githubUsername: '',
        adminPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.githubUsername.trim()) {
            setError('请输入 GitHub 用户名');
            return;
        }
        setStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();

        if (formData.adminPassword.length < 6) {
            setError('密码长度至少需要 6 位');
            return;
        }

        if (formData.adminPassword !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 保存配置
            await axios.post(`${config.API_URL}/api/setup/initialize`, {
                githubUsername: formData.githubUsername,
                adminPassword: formData.adminPassword,
                githubToken: formData.githubToken
            });

            setStep(3);

            // 3秒后完成设置
            setTimeout(() => {
                onComplete(formData.githubUsername);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || '初始化失败，请重试');
            setLoading(false);
        }
    };

    return (
        <div className="setup-container">
            <Helmet>
                <title>系统初始化 | 罗德岛终端</title>
            </Helmet>

            <div className="setup-card rhodes-card">
                <div className="setup-header">
                    <h1 className="text-h1">罗德岛终端 - 系统初始化</h1>
                    <div className="setup-progress">
                        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                </div>

                {step === 1 && (
                    <form onSubmit={handleStep1Submit} className="setup-form">
                        <div className="setup-step">
                            <h2 className="text-h2">步骤 1: GitHub 配置</h2>
                            <p className="text-gray">设置您的 GitHub 用户名以展示个人信息和仓库</p>

                            <div className="input-group">
                                <label className="text-mono">GitHub 用户名</label>
                                <input
                                    type="text"
                                    name="githubUsername"
                                    className="rhodes-input"
                                    value={formData.githubUsername}
                                    onChange={handleChange}
                                    placeholder="例如: bwwq"
                                    autoFocus
                                />
                                <small className="text-gray">
                                    将用于获取您的 GitHub 头像、仓库列表等信息
                                </small>
                            </div>

                            <div className="input-group">
                                <label className="text-mono">
                                    GitHub Token (可选)
                                    <span className="badge-optional">推荐</span>
                                </label>
                                <input
                                    type="password"
                                    name="githubToken"
                                    className="rhodes-input"
                                    value={formData.githubToken || ''}
                                    onChange={handleChange}
                                    placeholder="ghp_..."
                                />
                                <div className="token-help">
                                    <small className="text-gray">
                                        用于提高 API 限流阈值（未认证每小时60次，认证后5000次）。
                                        <br />
                                        <details>
                                            <summary style={{ cursor: 'pointer', color: 'var(--rhodes-cyan)' }}>如何获取 Token?</summary>
                                            <ol style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                                <li>访问 <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rhodes-cyan)' }}>GitHub Tokens 设置</a></li>
                                                <li>点击 "Generate new token (classic)"</li>
                                                <li>Note 填 "Blog API"，Expiration 选 "No expiration"</li>
                                                <li>Scopes 只勾选 <code>public_repo</code> (或不勾选)</li>
                                                <li>点击生成并复制 Token 到此处</li>
                                            </ol>
                                        </details>
                                    </small>
                                </div>
                            </div>

                            {error && <div className="error-msg text-orange">{error}</div>}

                            <div className="setup-actions">
                                <button type="submit" className="rhodes-btn primary">
                                    下一步 →
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleStep2Submit} className="setup-form">
                        <div className="setup-step">
                            <h2 className="text-h2">步骤 2: 安全配置</h2>
                            <p className="text-gray">设置管理员密钥以保护您的博客编辑权限</p>

                            <div className="input-group">
                                <label className="text-mono">管理员密钥</label>
                                <input
                                    type="password"
                                    name="adminPassword"
                                    className="rhodes-input"
                                    value={formData.adminPassword}
                                    onChange={handleChange}
                                    placeholder="至少 6 位字符"
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label className="text-mono">确认密钥</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="rhodes-input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="再次输入密钥"
                                />
                            </div>

                            {error && <div className="error-msg text-orange">{error}</div>}

                            <div className="setup-actions">
                                <button
                                    type="button"
                                    className="rhodes-btn"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    ← 上一步
                                </button>
                                <button
                                    type="submit"
                                    className="rhodes-btn primary"
                                    disabled={loading}
                                >
                                    {loading ? '初始化中...' : '完成设置 ✓'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="setup-complete">
                        <div className="success-icon">✓</div>
                        <h2 className="text-h2">初始化完成！</h2>
                        <p className="text-gray">正在进入罗德岛终端...</p>
                        <div className="loading-bar">
                            <div className="loading-progress"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="setup-footer text-mono text-gray">
                <p>明日方舟风格博客系统 v1.0</p>
                <p>Created with ❤️ | Inspired by Arknights</p>
            </div>
        </div>
    );
};

export default Setup;
