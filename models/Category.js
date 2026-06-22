const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            enum: ['articles', 'blogs', 'videos', 'shorts'],
            required: true
        }
    },
    { timestamps: true }
);

// Unique index on slug and type combination
categorySchema.index({ slug: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);