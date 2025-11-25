import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import si from 'systeminformation';
import dotenv from 'dotenv';
import os from 'os';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: { error: '登录尝试次数过多，请一小时后再试' }
});
app.use('/api/auth', authLimiter);

// Import routes
import operatorsRouter from './routes/operators.js';
import githubRouter from './routes/github.js';
import blogRouter from './routes/blog.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import setupRouter from './routes/setup.js';

// Serve static files from public directory
app.use(express.static('public'));

app.use('/api/operators', operatorsRouter);
app.use('/api/github', githubRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/setup', setupRouter);

// WebSocket for real-time server monitoring
io.on('connection', async (socket) => {
    console.log('客户端已连接监控');

    // Send static system info once
    const sendSystemInfo = async () => {
        try {
            const osInfo = await si.osInfo();
            let distro = osInfo.distro;

            // Fix for Windows encoding issues (garbled localized names)
            if (osInfo.platform === 'win32' || osInfo.platform === 'Windows') {
                const release = os.release();
                const build = parseInt(release.split('.')[2]);
                if (build >= 22000) {
                    distro = 'Windows 11';
                } else {
                    distro = 'Windows 10';
                }
            }

            socket.emit('systemInfo', {
                platform: osInfo.platform,
                distro: distro,
                release: osInfo.release,
                arch: osInfo.arch
            });
        } catch (error) {
            console.error('获取静态系统信息失败:', error);
        }
    };

    // Send immediately on connection
    sendSystemInfo();

    // Allow client to request it manually (e.g. on page load)
    socket.on('requestSystemInfo', sendSystemInfo);

    // Send server stats every second
    const interval = setInterval(async () => {
        try {
            const cpu = await si.currentLoad();
            const mem = await si.mem();
            const time = si.time();

            const stats = {
                cpu: Math.round(cpu.currentLoad),
                mem: Math.round((mem.used / mem.total) * 100),
                uptime: time.uptime,
                time: new Date().toLocaleTimeString()
            };

            socket.emit('metrics', stats);
        } catch (error) {
            console.error('获取系统信息失败:', error);
        }
    }, 1000);

    socket.on('disconnect', () => {
        console.log('客户端已断开连接');
        clearInterval(interval);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`[罗德岛] 服务器运行于端口 ${PORT}`);
    console.log(`[系统] WebSocket 监控已启用`);
});
