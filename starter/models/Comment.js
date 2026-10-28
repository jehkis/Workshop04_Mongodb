const mongoose = require('mongoose');

// ========================================
// Task 9 - Comment model that references a Post
// ========================================
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true,
        maxlength: [500, 'Comment can be at most 500 characters']
    },
    author: {
        type: String,
        trim: true,
        default: 'Anonymous'
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);
