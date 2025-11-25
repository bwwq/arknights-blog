import express from 'express';
import { Octokit } from '@octokit/rest';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// Default GitHub username (can be configured via env)
const DEFAULT_GITHUB_USER = process.env.GITHUB_USERNAME || 'bwwq';

// GET /api/github/user (default user)
router.get('/user', async (req, res) => {
    const cacheKey = `user_${DEFAULT_GITHUB_USER}`;

    try {
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const { data } = await octokit.users.getByUsername({ username: DEFAULT_GITHUB_USER });
        cache.set(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('GitHub API Error:', error);
        res.status(500).json({ error: 'Failed to fetch GitHub user data' });
    }
});

// GET /api/github/user/:username
router.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    const cacheKey = `user_${username}`;

    try {
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const { data } = await octokit.users.getByUsername({ username });
        cache.set(cacheKey, data);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch GitHub user data' });
    }
});

// GET /api/github/repos/:username
router.get('/repos/:username', async (req, res) => {
    const { username } = req.params;
    const cacheKey = `repos_${username}`;

    try {
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const { data } = await octokit.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 10
        });
        cache.set(cacheKey, data);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch GitHub repos' });
    }
});

export default router;
