import express from 'express';
import fs from 'fs';
import path from 'path';
import requireAuth from '../middleware/auth.js';

const router = express.Router();
const dataPath = path.join(process.cwd(), 'data', 'blogs.json');

// Helper to read blogs
const readBlogs = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading blogs:', err);
        // If JSON is corrupted, try to read backup if exists
        const backupPath = `${dataPath}.bak`;
        if (fs.existsSync(backupPath)) {
            console.log('Attempting to recover from backup...');
            try {
                const backupData = fs.readFileSync(backupPath, 'utf8');
                return JSON.parse(backupData);
            } catch (backupErr) {
                console.error('Backup also corrupted:', backupErr);
            }
        }
        return [];
    }
};

// Helper to write blogs safely (Atomic Write)
const writeBlogs = (blogs) => {
    const tempPath = `${dataPath}.tmp`;
    const backupPath = `${dataPath}.bak`;

    try {
        const content = JSON.stringify(blogs, null, 4);

        // 1. Write to temp file first
        fs.writeFileSync(tempPath, content);

        // 2. Create backup of current file (if exists)
        if (fs.existsSync(dataPath)) {
            fs.copyFileSync(dataPath, backupPath);
        }

        // 3. Rename temp file to actual file (Atomic operation)
        fs.renameSync(tempPath, dataPath);

    } catch (err) {
        console.error('Error writing blogs:', err);
        // Cleanup temp file if exists
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        throw err; // Re-throw to let caller know
    }
};
// GET /api/blogs - Get all blog posts (paginated & searchable)
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search ? req.query.search.toLowerCase() : '';

    let blogs = readBlogs();

    // Filter by search query
    if (search) {
        blogs = blogs.filter(blog =>
            (blog.title && blog.title.toLowerCase().includes(search)) ||
            (blog.content && blog.content.toLowerCase().includes(search)) ||
            (blog.tags && blog.tags.some(tag => tag && tag.toLowerCase().includes(search)))
        );
    }

    // Sort by date desc
    blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {
        total: blogs.length,
        totalPages: Math.ceil(blogs.length / limit),
        currentPage: page,
        next: endIndex < blogs.length ? { page: page + 1, limit } : null,
        previous: startIndex > 0 ? { page: page - 1, limit } : null,
        posts: blogs.slice(startIndex, endIndex)
    };

    res.json(results);
});

// GET /api/blogs/:id - Get single blog post (PUBLIC)
router.get('/:id', (req, res) => {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id === parseInt(req.params.id));
    if (blog) {
        res.json(blog);
    } else {
        res.status(404).json({ error: '未找到博客文章' });
    }
});

import { validateBlogPost, sanitizeString } from '../utils/validation.js';

// POST /api/blogs - Create new blog post (PROTECTED)
router.post('/', requireAuth, (req, res) => {
    const blogs = readBlogs();

    // Validate input
    const validation = validateBlogPost(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const newBlog = {
        id: Date.now(), // Use timestamp as ID to avoid collision
        title: sanitizeString(req.body.title, 200),
        content: req.body.content, // Content might be large, don't trim too aggressively but check size
        excerpt: sanitizeString(req.body.excerpt, 500),
        tags: req.body.tags || [],
        date: new Date().toISOString().split('T')[0],
        author: '博士'
    };

    blogs.unshift(newBlog); // Add to beginning
    writeBlogs(blogs);

    res.status(201).json(newBlog);
});

// PUT /api/blogs/:id - Update blog post (PROTECTED)
router.put('/:id', requireAuth, (req, res) => {
    const blogs = readBlogs();
    const index = blogs.findIndex(b => b.id === parseInt(req.params.id));

    if (index !== -1) {
        // Validate input
        const validation = validateBlogPost(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join(', ') });
        }

        const updatedBlog = {
            ...blogs[index],
            title: sanitizeString(req.body.title, 200),
            content: req.body.content,
            excerpt: sanitizeString(req.body.excerpt, 500),
            tags: req.body.tags || []
        };

        blogs[index] = updatedBlog;
        writeBlogs(blogs);
        res.json(blogs[index]);
    } else {
        res.status(404).json({ error: '未找到博客文章' });
    }
});

// DELETE /api/blogs/:id - Delete blog post (PROTECTED)
router.delete('/:id', requireAuth, (req, res) => {
    const blogs = readBlogs();
    const index = blogs.findIndex(b => b.id === parseInt(req.params.id));

    if (index !== -1) {
        blogs.splice(index, 1);
        writeBlogs(blogs);
        res.json({ message: '博客文章已删除' });
    } else {
        res.status(404).json({ error: '未找到博客文章' });
    }
});

export default router;
