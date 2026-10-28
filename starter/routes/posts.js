const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();

// Fields a client is allowed to set - prevents overwriting _id, createdAt etc.
const ALLOWED_FIELDS = ['title', 'description', 'author', 'tags'];

function pickAllowed(body) {
    const data = {};
    for (const field of ALLOWED_FIELDS) {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    }
    // Accept tags also as a comma-separated string (e.g. from the HTML form)
    if (typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    }
    return data;
}

// Rejects invalid ObjectIds before they reach the database (Task 4)
function validateId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    next();
}

// Turns Mongoose errors into proper HTTP responses (Task 7)
function handleError(err, res) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: Object.values(err.errors).map((e) => e.message)
        });
    }
    console.error('Database error:', err.message);
    return res.status(500).json({ error: err.message });
}

// ========================================
// Task 3 - Create (POST /api/posts)
// ========================================
router.post('/', async (req, res) => {
    try {
        const post = await Post.create(pickAllowed(req.body));
        res.status(201).json(post);
    } catch (err) {
        handleError(err, res);
    }
});

// ========================================
// Task 4 + Task 10 - Read all with pagination (GET /api/posts?page=1&limit=10)
// ========================================
router.get('/', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Post.countDocuments()
        ]);

        res.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        handleError(err, res);
    }
});

// ========================================
// Task 4 + Task 9 - Read one with its comments (GET /api/posts/:id)
// ========================================
router.get('/:id', validateId, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate({
            path: 'comments',
            options: { sort: { createdAt: 1 } }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        handleError(err, res);
    }
});

// ========================================
// Task 5 - Update (PUT /api/posts/:id)
// ========================================
router.put('/:id', validateId, async (req, res) => {
    try {
        const updateData = pickAllowed(req.body);
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: `Nothing to update. Allowed fields: ${ALLOWED_FIELDS.join(', ')}` });
        }

        // runValidators makes the schema rules apply to updates too
        const post = await Post.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        handleError(err, res);
    }
});

// ========================================
// Task 5 - Delete (DELETE /api/posts/:id)
// ========================================
router.delete('/:id', validateId, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // Remove the post's comments as well so no orphans are left behind
        const { deletedCount } = await Comment.deleteMany({ post: post._id });
        res.json({ message: 'Post deleted', id: post._id, deletedComments: deletedCount });
    } catch (err) {
        handleError(err, res);
    }
});

// ========================================
// Task 9 - Comments of a post
// ========================================
router.post('/:id/comments', validateId, async (req, res) => {
    try {
        const exists = await Post.exists({ _id: req.params.id });
        if (!exists) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const comment = await Comment.create({
            text: req.body.text,
            author: req.body.author,
            post: req.params.id
        });
        res.status(201).json(comment);
    } catch (err) {
        handleError(err, res);
    }
});

router.get('/:id/comments', validateId, async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 });
        res.json(comments);
    } catch (err) {
        handleError(err, res);
    }
});

module.exports = router;
