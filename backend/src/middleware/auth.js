import dotenv from 'dotenv';
dotenv.config();

const requireAuth = (req, res, next) => {
    // Get password from headers
    // Client should send: "x-admin-password": "your_password"
    const providedPassword = req.headers['x-admin-password'];
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('--- Auth Debug ---');
    console.log('Provided:', providedPassword ? '***' + providedPassword.slice(-3) : 'undefined');
    console.log('Expected:', adminPassword ? '***' + adminPassword.slice(-3) : 'undefined');
    console.log('Match:', providedPassword === adminPassword);
    console.log('------------------');

    // If no password set in server, allow (or block, depending on policy. Here we block)
    if (!adminPassword) {
        return res.status(503).json({ error: 'Server not initialized (Admin password not set)' });
    }

    if (providedPassword === adminPassword) {
        next(); // Password matches, proceed
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid Password' });
    }
};

export { requireAuth as authenticateAdmin };
export default requireAuth;
