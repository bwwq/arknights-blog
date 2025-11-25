const config = {
    // 在生产环境（构建后），默认使用相对路径，以便通过反向代理访问后端
    // 在开发环境，默认使用 localhost:3001
    API_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001')
};

export default config;
