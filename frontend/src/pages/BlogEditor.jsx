import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleMDE from 'react-simplemde-editor';
import axios from 'axios';
import 'easymde/dist/easymde.min.css';
import './BlogEditor.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import config from '../config';
import { Helmet } from 'react-helmet-async';

const BlogEditor = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    // Auth states from Context
    const { isAuthenticated, adminPassword, login, loading: authLoading } = useAuth();
    const { success, error: toastError, info } = useToast();

    const [isSetup, setIsSetup] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Editor states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Form inputs for auth
    const [passwordInput, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Auto-save effect
    useEffect(() => {
        if (!title && !content) return;

        const timer = setTimeout(() => {
            localStorage.setItem('draft_title', title);
            localStorage.setItem('draft_content', content);
        }, 3000);

        return () => clearTimeout(timer);
    }, [title, content]);

    // Load draft on new post
    useEffect(() => {
        if (!isEditing && !title && !content) {
            const draftTitle = localStorage.getItem('draft_title');
            const draftContent = localStorage.getItem('draft_content');
            if (draftTitle || draftContent) {
                if (window.confirm('发现未保存的草稿，是否恢复？')) {
                    if (draftTitle) setTitle(draftTitle);
                    if (draftContent) setContent(draftContent);
                    info('草稿已恢复');
                } else {
                    localStorage.removeItem('draft_title');
                    localStorage.removeItem('draft_content');
                }
            }
        }
    }, [isEditing, info]);

    // Check auth status and fetch data if editing
    useEffect(() => {
        // 1. Check Auth Status
        axios.get(`${config.API_URL}/api/auth/status`)
            .then(res => {
                setIsSetup(res.data.isSetup);
                if (!id) setDataLoading(false);
            })
            .catch(err => {
                console.error('Auth check failed:', err);
                const status = err.response ? err.response.status : '网络错误';
                setError(`无法连接到验证服务器 (${status})。请确保后端已重启。`);
                setDataLoading(false);
            });

        // 2. Fetch Blog Data if Editing
        if (id) {
            axios.get(`${config.API_URL}/api/blogs/${id}`)
                .then(res => {
                    setTitle(res.data.title);
                    setContent(res.data.content);
                    setDataLoading(false);
                })
                .catch(err => {
                    console.error('获取文章失败:', err);
                    toastError('无法加载文章数据');
                    navigate('/blog');
                });
        }
    }, [id, navigate, toastError]);

    const handleSetup = (e) => {
        e.preventDefault();
        if (passwordInput !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }
        if (passwordInput.length < 6) {
            setError('密码长度至少需要6位');
            return;
        }

        axios.post(`${config.API_URL}/api/auth/setup`, { password: passwordInput })
            .then(res => {
                if (res.data.success) {
                    setIsSetup(true);
                    login(passwordInput);
                    setError('');
                    success('系统初始化成功');
                }
            })
            .catch(err => {
                setError(err.response?.data?.error || '设置失败');
            });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post(`${config.API_URL}/api/auth/verify`, { password: passwordInput })
            .then(res => {
                if (res.data.success) {
                    login(passwordInput);
                    setError('');
                    success('身份验证成功');
                }
            })
            .catch(err => {
                setError(err.response?.data?.error || '验证失败');
                setPasswordInput('');
            });
    };

    const handleChange = (value) => {
        setContent(value);
    };

    const handleCancel = () => {
        if (isEditing) {
            navigate(`/blog/${id}`);
        } else {
            navigate('/blog');
        }
    };

    const handleDelete = () => {
        if (!window.confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
            return;
        }

        axios.delete(`${config.API_URL}/api/blogs/${id}`, {
            headers: { 'x-admin-password': adminPassword }
        })
            .then(() => {
                success('文章已删除');
                navigate('/blog');
            })
            .catch(err => {
                console.error('删除失败:', err);
                toastError('删除失败: ' + (err.response?.data?.error || err.message));
            });
    };

    const handlePublish = () => {
        if (!title.trim() || !content.trim()) {
            toastError('标题和内容不能为空');
            return;
        }

        setLoading(true);

        const excerpt = content.replace(/[#*`]/g, '').slice(0, 150) + '...';
        const tags = ['Blog', 'Tech'];

        const postData = { title, content, excerpt, tags };
        const configObj = {
            headers: { 'x-admin-password': adminPassword }
        };

        const request = isEditing
            ? axios.put(`${config.API_URL}/api/blogs/${id}`, postData, configObj)
            : axios.post(`${config.API_URL}/api/blogs`, postData, configObj);

        request
            .then(res => {
                console.log('保存成功:', res.data);
                success(isEditing ? '文章更新成功' : '文章发布成功');
                localStorage.removeItem('draft_title');
                localStorage.removeItem('draft_content');
                navigate(isEditing ? `/blog/${id}` : '/blog');
            })
            .catch(err => {
                console.error('保存失败:', err);
                setLoading(false);
                toastError('保存失败: ' + (err.response?.data?.error || err.message));
            });
    };

    if (authLoading || dataLoading) {
        return (
            <div className="editor-container">
                <div className="loading-state text-mono">正在加载数据...</div>
            </div>
        );
    }

    // 1. Setup Mode
    if (!isSetup) {
        return (
            <div className="editor-container">
                <div className="rhodes-card auth-card">
                    <h1 className="text-h1">系统初始化</h1>
                    <p className="text-gray" style={{ marginBottom: '24px' }}>首次使用需要设置管理员密钥</p>
                    <form onSubmit={handleSetup}>
                        <div className="input-group">
                            <label className="text-mono">设置密钥</label>
                            <input type="password" className="rhodes-input" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="请输入新密钥..." autoFocus />
                        </div>
                        <div className="input-group">
                            <label className="text-mono">确认密钥</label>
                            <input type="password" className="rhodes-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入密钥..." />
                        </div>
                        {error && <div className="error-msg text-orange">{error}</div>}
                        <div className="auth-actions">
                            <button type="submit" className="rhodes-btn primary">初始化系统</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // 2. Login Mode
    if (!isAuthenticated) {
        return (
            <div className="editor-container">
                <div className="rhodes-card auth-card">
                    <h1 className="text-h1">身份验证</h1>
                    <p className="text-gray" style={{ marginBottom: '24px' }}>请输入管理员密钥以访问终端</p>
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label className="text-mono">密钥</label>
                            <input type="password" className="rhodes-input" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="请输入管理员密钥..." autoFocus />
                        </div>
                        {error && <div className="error-msg text-orange">{error}</div>}
                        <div className="auth-actions">
                            <button type="submit" className="rhodes-btn primary">验证身份</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // 3. Editor Mode
    return (
        <div className="editor-container">
            <Helmet>
                <title>{isEditing ? '编辑文章' : '新文章'} | 罗德岛终端</title>
            </Helmet>
            <div className="editor-header">
                <h1 className="text-h1">{isEditing ? '编辑文章' : '新文章'}</h1>
                <div className="editor-actions">
                    {isEditing && (
                        <button onClick={handleDelete} className="rhodes-btn danger" style={{ marginRight: '10px', borderColor: '#ff4d4f', color: '#ff4d4f' }}>删除</button>
                    )}
                    <button onClick={handleCancel} className="rhodes-btn">取消</button>
                    <button onClick={handlePublish} className="rhodes-btn primary" disabled={loading}>
                        {loading ? '保存中...' : (isEditing ? '更新' : '发布')}
                    </button>
                </div>
            </div>

            <div className="rhodes-card editor-card">
                <div className="input-group">
                    <label className="text-mono">标题</label>
                    <input type="text" className="rhodes-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入文章标题..." />
                </div>

                <div className="input-group">
                    <label className="text-mono">内容</label>
                    <div className="mde-wrapper">
                        <SimpleMDE
                            value={content}
                            onChange={handleChange}
                            options={{
                                spellChecker: false,
                                status: false,
                                placeholder: "开始写作...",
                                toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "upload-image", "|", "preview", "side-by-side", "fullscreen"],
                                uploadImage: true,
                                imageUploadFunction: (file, onSuccess, onError) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const base64String = reader.result;
                                        axios.post(`${config.API_URL}/api/upload`, {
                                            image: base64String,
                                            name: file.name
                                        }, {
                                            headers: { 'x-admin-password': adminPassword }
                                        })
                                            .then(res => onSuccess(`${config.API_URL}${res.data.url}`))
                                            .catch(err => {
                                                console.error('上传失败:', err);
                                                toastError('图片上传失败');
                                                onError(err.message || '上传失败');
                                            });
                                    };
                                    reader.readAsDataURL(file);
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditor;
