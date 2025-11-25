import dotenv from 'dotenv';
dotenv.config();

const requireAuth = (req, res, next) => {
    // Get password from headers
    // Client should send: "x-admin-password": "your_password"
    const providedPassword = req.headers['x-admin-password'];
    const adminPassword = process.env.ADMIN_PASSWORD;

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

export default requireAuth;
