const mongoose = require('mongoose');

// ========================================
// Task 2 + Task 7 + Task 8 - Post schema, validation and indexes
// ========================================
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title can be at most 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters']
    },
    // Additional field of my choice
    author: {
        type: String,
        trim: true,
        default: 'Anonymous',
        // Custom validator (Task 7)
        validate: {
            validator: (value) => /^[\p{L}\s.'-]{2,50}$/u.test(value),
            message: 'Author must be 2-50 letters (spaces, dots, apostrophes and hyphens allowed)'
        }
    },
    tags: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Adds updatedAt automatically; createdAt is defined above
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Task 8 - indexes for frequently queried fields
postSchema.index({ title: 1 });
postSchema.index({ createdAt: -1 });

// Task 9 - virtual relationship: all comments that reference this post
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

module.exports = mongoose.model('Post', postSchema);
