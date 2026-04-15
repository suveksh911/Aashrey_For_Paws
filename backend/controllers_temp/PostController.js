const PostModel = require('../models/Post');


const getAllPosts = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category && category !== 'All' ? { category } : {};
        const posts = await PostModel.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
};


const createPost = async (req, res) => {
    try {
        const { title, content, category, image } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }
        const post = new PostModel({
            title, content, category: category || 'General',
            image: image || '',
            authorId: req.user._id,
            author: req.user.name
        });
        await post.save();
        res.status(201).json({ success: true, message: 'Post created', data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
};

 
const deletePost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        if (post.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await PostModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
};

 
const toggleLike = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const uid = req.user.email;  
        const alreadyLiked = post.likedBy.includes(uid);
        if (alreadyLiked) {
            post.likedBy = post.likedBy.filter(u => u !== uid);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(uid);
            post.likes += 1;
        }
        await post.save();
        res.status(200).json({ success: true, data: { likes: post.likes, likedBy: post.likedBy } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update like' });
    }
};

 
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment text required' });

        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = { userId: req.user._id, user: req.user.name, text, createdAt: new Date() };
        post.comments.push(comment);
        await post.save();
        
         
        try {
            const { createNotification } = require('./NotificationController');
            if (post.authorId.toString() !== req.user._id.toString()) {
                await createNotification(
                    post.authorId,
                    'info',
                    `💬 ${req.user.name} commented on your post: "${post.title.substring(0, 30)}..."`,
                    `/community`
                );
            }
        } catch (notifierErr) {
            console.warn("Notification for comment failed:", notifierErr.message);
        }

        const newComment = post.comments[post.comments.length - 1];
        res.status(201).json({ success: true, data: newComment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
};

 
const deleteComment = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        comment.deleteOne();
        await post.save();
        res.status(200).json({ success: true, message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
};

 
const editComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment text required' });

        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        comment.text = text;
        await post.save();
        res.status(200).json({ success: true, message: 'Comment updated', data: comment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update comment' });
    }
};

 
const toggleCommentLike = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        const uid = req.user.email;
        const alreadyLiked = (comment.likedBy || []).includes(uid);
        
        if (alreadyLiked) {
            comment.likedBy = comment.likedBy.filter(u => u !== uid);
            comment.likes = Math.max(0, (comment.likes || 1) - 1);
        } else {
            if (!comment.likedBy) comment.likedBy = [];
            comment.likedBy.push(uid);
            comment.likes = (comment.likes || 0) + 1;
        }

        await post.save();
        res.status(200).json({ success: true, data: { likes: comment.likes, likedBy: comment.likedBy } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update comment like' });
    }
};

// POST /posts/:id/comment/:commentId/reply
const addCommentReply = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ success: false, message: 'Reply text required' });

        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        const reply = { userId: req.user._id, user: req.user.name, text, createdAt: new Date() };
        if (!comment.replies) comment.replies = [];
        comment.replies.push(reply);
        await post.save();

        // Notify comment author
        try {
            const { createNotification } = require('./NotificationController');
            if (comment.userId.toString() !== req.user._id.toString()) {
                await createNotification(
                    comment.userId,
                    'info',
                    `↩️ ${req.user.name} replied to your comment: "${comment.text.substring(0, 30)}..."`,
                    `/community`
                );
            }
        } catch (notifierErr) {
            console.warn("Notification for reply failed:", notifierErr.message);
        }

        const newReply = comment.replies[comment.replies.length - 1];
        res.status(201).json({ success: true, data: newReply });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add reply' });
    }
};

// POST /posts/:id/comment/:commentId/reply/:replyId/like
const toggleReplyLike = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

        const uid = req.user.email;
        const alreadyLiked = (reply.likedBy || []).includes(uid);

        if (alreadyLiked) {
            reply.likedBy = reply.likedBy.filter(u => u !== uid);
            reply.likes = Math.max(0, (reply.likes || 1) - 1);
        } else {
            if (!reply.likedBy) reply.likedBy = [];
            reply.likedBy.push(uid);
            reply.likes = (reply.likes || 0) + 1;
        }

        await post.save();
        res.status(200).json({ success: true, data: { likes: reply.likes, likedBy: reply.likedBy } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update reply like' });
    }
};

// DELETE /posts/:id/comment/:commentId/reply/:replyId
const deleteCommentReply = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

        if (reply.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        reply.deleteOne();
        await post.save();
        res.status(200).json({ success: true, message: 'Reply deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete reply' });
    }
};

module.exports = { 
    getAllPosts, 
    createPost, 
    deletePost, 
    toggleLike, 
    addComment, 
    deleteComment, 
    editComment,
    toggleCommentLike,
    addCommentReply,
    toggleReplyLike,
    deleteCommentReply
};



