import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { Helmet } from 'react-helmet-async';

const DebugPage = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        runTests();
    }, []);

    const runTests = async () => {
        const testResults = {};

        // Test 1: config
        try {
            const res = await axios.get(`${config.API_URL}/api/setup/status`);
            testResults.config = { success: true, data: res.data };
        } catch (err) {
            testResults.config = { success: false, error: err.message };
        }

        // Test 2: GitHub user
        try {
            const res = await axios.get(`${config.API_URL}/api/github/user`);
            testResults.githubUser = { success: true, data: res.data };
        } catch (err) {
            testResults.githubUser = { success: false, error: err.message };
        }

        // Test 3: GitHub events
        try {
            const res = await axios.get(`${config.API_URL}/api/github/events/bwwq`);
            testResults.githubEvents = { success: true, count: res.data.length };
        } catch (err) {
            testResults.githubEvents = { success: false, error: err.message };
        }

        setResults(testResults);
        setLoading(false);
    };

    if (loading) {
        return <div style={{ padding: '40px', color: '#23ADE5' }}>正在测试...</div>;
    }

    return (
        <div style={{
            fontFamily: 'monospace',
            padding: '40px',
            background: '#0a0a0a',
            color: '#23ADE5',
            minHeight: '100vh'
        }}>
            <Helmet>
                <title>API 调试 | 罗德岛终端</title>
            </Helmet>

            <h1 style={{ color: '#FF6B00' }}>API 调试结果</h1>

            <div style={{ marginTop: '30px' }}>
                <h2>1. 配置状态</h2>
                <pre style={{
                    background: '#000',
                    padding: '15px',
                    border: results.config?.success ? '2px solid #52c41a' : '2px solid #ff4d4f'
                }}>
                    {JSON.stringify(results.config, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>2. GitHub 用户信息</h2>
                <pre style={{
                    background: '#000',
                    padding: '15px',
                    border: results.githubUser?.success ? '2px solid #52c41a' : '2px solid #ff4d4f'
                }}>
                    {JSON.stringify(results.githubUser, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>3. GitHub Events</h2>
                <pre style={{
                    background: '#000',
                    padding: '15px',
                    border: results.githubEvents?.success ? '2px solid #52c41a' : '2px solid #ff4d4f'
                }}>
                    {JSON.stringify(results.githubEvents, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={runTests}
                    style={{
                        background: '#FF6B00',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    重新测试
                </button>
            </div>
        </div>
    );
};

export default DebugPage;
