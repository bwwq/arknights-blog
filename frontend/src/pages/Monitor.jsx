import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import config from '../config';
import './Monitor.css';
import { Helmet } from 'react-helmet-async';

const socket = io(config.API_URL);

const Monitor = () => {
    const [metrics, setMetrics] = useState([]);
    const [current, setCurrent] = useState({ cpu: 0, mem: 0, uptime: 0 });
    const [systemInfo, setSystemInfo] = useState({ distro: '获取中...' });

    useEffect(() => {
        socket.on('metrics', (data) => {
            setMetrics(prev => {
                const newMetrics = [...prev, data];
                if (newMetrics.length > 20) newMetrics.shift();
                return newMetrics;
            });
            setCurrent(data);
        });

        socket.on('systemInfo', (data) => {
            setSystemInfo(data);
        });

        // Request system info explicitly in case we missed the initial event
        socket.emit('requestSystemInfo');

        return () => {
            socket.off('metrics');
            socket.off('systemInfo');
        };
    }, []);

    return (
        <div className="monitor-container">
            <Helmet>
                <title>系统监控 | 罗德岛终端</title>
                <meta name="description" content="实时监控服务器状态，包括CPU、内存与运行时间。" />
            </Helmet>
            <div className="monitor-header">
                <h1 className="text-h1">系统监控</h1>
                <div className="status-badge online">在线</div>
            </div>

            <div className="monitor-grid">
                {/* CPU Panel */}
                <div className="rhodes-card monitor-card">
                    <div className="card-header">
                        <span className="text-mono">CPU 负载</span>
                        <span className="value text-cyan">{current.cpu}%</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#23ADE5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#23ADE5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    itemStyle={{ color: '#23ADE5' }}
                                />
                                <Area type="monotone" dataKey="cpu" name="CPU 负载" stroke="#23ADE5" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Memory Panel */}
                <div className="rhodes-card monitor-card">
                    <div className="card-header">
                        <span className="text-mono">内存使用</span>
                        <span className="value text-orange">{current.mem}%</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    itemStyle={{ color: '#FF5500' }}
                                />
                                <Line type="step" dataKey="mem" name="内存使用" stroke="#FF5500" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="rhodes-card info-panel">
                    <h2 className="text-h2">服务器信息</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">操作系统</span>
                            <span className="val">{systemInfo.distro}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">运行时间</span>
                            <span className="val">{Math.floor(current.uptime / 60)} 分钟</span>
                        </div>
                        <div className="info-item">
                            <span className="label">运行环境</span>
                            <span className="val">生产环境</span>
                        </div>
                        <div className="info-item">
                            <span className="label">状态</span>
                            <span className="val text-cyan">正常</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Monitor;
