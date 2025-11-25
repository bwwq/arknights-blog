import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import config from '../config';
import './BlogPost.css';
import { Helmet } from 'react-helmet-async';

const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${config.API_URL}/api/blogs/${id}`)
            .then(res => {
                setPost(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('获取博客文章失败:', err);
                setError('无法加载文章');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="loading text-mono">加载中...</div>;
    if (error) return <div className="loading text-mono text-orange">{error}</div>;
    if (!post) return <div className="loading text-mono">未找到文章</div>;

    return (
        <div className="blog-post-container">
            <Helmet>
                <title>{post.title} | 罗德岛终端</title>
                <meta name="description" content={post.excerpt || post.title} />
            </Helmet>
            <div className="post-header">
                <div className="header-top">
                    <Link to="/blog" className="back-link text-mono">&lt; 返回列表</Link>
                    <Link to={`/blog/${id}/edit`} className="rhodes-btn sm">
                        编辑文章
                    </Link>
                </div>
                <h1 className="post-title text-h1">{post.title}</h1>
                <div className="post-meta text-mono">
                    <span>日期: {post.date}</span>
                    <span>作者: {post.author}</span>
                    <span className="id-tag">ID: #{post.id.toString().padStart(4, '0')}</span>
                </div>
            </div>

            <div className="rhodes-card post-content">
                <ReactMarkdown
                    components={{
                        img: ({ ...props }) => <img style={{ maxWidth: '100%' }} {...props} />
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default BlogPost;
