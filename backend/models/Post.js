const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: String, required: true },
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    user: { type: String, required: true },
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    replies: [ReplySchema],
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    category: {
        type: String,
        enum: ['General', 'Advice', 'Story', 'Question'],
        default: 'General'
    },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: [CommentSchema],
    createdAt: { type: Date, default: Date.now }
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;



