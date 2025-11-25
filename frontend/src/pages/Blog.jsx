import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Blog.css';
import config from '../config';
import { Helmet } from 'react-helmet-async';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setLoading(true);
        axios.get(`${config.API_URL}/api/blogs?page=${page}&limit=5&search=${debouncedSearch}`)
            .then(res => {
                setPosts(res.data.posts);
                setPagination({
                    total: res.data.total,
                    totalPages: res.data.totalPages,
                    currentPage: res.data.currentPage,
                    next: res.data.next,
                    previous: res.data.previous
                });
                setLoading(false);
                window.scrollTo(0, 0);
            })
            .catch(err => {
                console.error('获取博客列表失败:', err);
                setLoading(false);
            });
    }, [page, debouncedSearch]);

    return (
        <div className="blog-container">
            <Helmet>
                <title>情报中心 | 罗德岛终端</title>
                <meta name="description" content="罗德岛内部情报与技术文档库" />
            </Helmet>
            <div className="blog-header">
                <h1 className="text-h1">情报中心</h1>
                <div className="blog-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            className="rhodes-input search-input"
                            placeholder="搜索情报..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Link to="/blog/new" className="rhodes-btn primary">
                        + 新建档案
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="loading-state text-mono">正在解密数据...</div>
            ) : (
                <>
                    {posts.length === 0 ? (
                        <div className="empty-state text-gray">暂无相关情报</div>
                    ) : (
                        <div className="blog-list">
                            {posts.map(post => (
                                <article key={post.id} className="rhodes-card blog-card">
                                    <div className="card-header">
                                        <h2 className="blog-title">
                                            <Link to={`/blog/${post.id}`}>{post.title}</Link>
                                        </h2>
                                        <span className="blog-date text-mono">{post.date}</span>
                                    </div>
                                    <div className="blog-excerpt text-gray">
                                        {post.excerpt}
                                    </div>
                                    <div className="card-footer">
                                        <div className="tags">
                                            {post.tags && post.tags.map(tag => (
                                                <span key={tag} className="tag text-mono">#{tag}</span>
                                            ))}
                                        </div>
                                        <Link to={`/blog/${post.id}`} className="read-more text-cyan">
                                            阅读更多 &gt;
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="rhodes-btn"
                                disabled={!pagination.previous}
                                onClick={() => setPage(p => p - 1)}
                            >
                                &lt; 上一页
                            </button>
                            <span className="page-info text-mono">
                                {pagination.currentPage} / {pagination.totalPages}
                            </span>
                            <button
                                className="rhodes-btn"
                                disabled={!pagination.next}
                                onClick={() => setPage(p => p + 1)}
                            >
                                下一页 &gt;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Blog;
