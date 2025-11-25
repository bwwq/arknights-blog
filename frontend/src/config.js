const config = {
    // 在生产环境（构建后），默认使用相对路径，以便通过反向代理访问后端
    // 如果检测到是 5173 端口（通常是 serve 直接启动），则尝试连接同域名的 3001 端口
    API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD
        ? (window.location.port === '5173' ? `${window.location.protocol}//${window.location.hostname}:3001` : '')
        : 'http://localhost:3001')
};

export default config;
