const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    author: {
        type: String, // Storing author name directly for simplicity, or could use ObjectId ref
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;
