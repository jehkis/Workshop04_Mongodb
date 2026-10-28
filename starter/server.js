const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const postsRouter = require('./routes/posts');

// ========================================
// Task 1 - Express app and MongoDB connection
// ========================================
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing. Copy .env.example to .env and add your connection string.');
    process.exit(1);
}

// useNewUrlParser/useUnifiedTopology are no longer needed in Mongoose 7+
mongoose.connect(process.env.MONGODB_URI).catch(() => {
    // The 'error' listener below logs the reason
});

mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.log('MongoDB connection error:', err.message);
});

// ========================================
// Middleware
// ========================================
// Task 3 - parse JSON request bodies
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static files (index: false so GET / is handled by the route below)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// ========================================
// Page routes
// ========================================
const pages = {
    '/': 'index.html',
    '/about': 'about.html',
    '/contact': 'contact.html',
    '/add-post': 'add-post.html'
};

for (const [route, file] of Object.entries(pages)) {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', file));
    });
}

// ========================================
// Tasks 3-5, 9, 10 - REST API for posts
// ========================================
app.use('/api/posts', postsRouter);

// ========================================
// Error handling
// ========================================
// Invalid JSON in a request body
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    next(err);
});

// 404 - unknown API routes get JSON, everything else the HTML page
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 500 - placed last
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    if (req.path.startsWith('/api/')) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

// ========================================
// Start the server
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`
  Available routes:
  GET  /              - Home page
  GET  /about         - About page
  GET  /contact       - Contact page
  GET  /add-post      - Form for creating posts

  API endpoints:
  POST   /api/posts                 - Create a new post
  GET    /api/posts?page=1&limit=10 - Get posts (paginated)
  GET    /api/posts/:id             - Get a single post with comments
  PUT    /api/posts/:id             - Update a post
  DELETE /api/posts/:id             - Delete a post and its comments
  POST   /api/posts/:id/comments    - Add a comment to a post
  GET    /api/posts/:id/comments    - Get comments of a post
  `);
});
