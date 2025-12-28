const PostModel = require("../Models/Post");

const getAllPosts = async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch posts" });
    }
}

const createPost = async (req, res) => {
    try {
        const { title, content, author, image } = req.body;
        const newPost = new PostModel({ title, content, author, image });
        await newPost.save();
        res.status(201).json({ success: true, message: "Post created successfully", data: newPost });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to create post" });
    }
}

module.exports = {
    getAllPosts,
    createPost
}
