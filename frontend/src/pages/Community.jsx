import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPen, FaUserCircle, FaHeart, FaComment, FaShare, FaTimes, FaSearch, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';

const CATEGORIES = ['All', 'General', 'Advice', 'Story', 'Question'];

const MOCK_POSTS = [
    {
        _id: 'p1',
        title: 'Tips for first-time dog owners?',
        content: 'I just adopted a 2-month-old Golden Retriever! Looking for advice on potty training and diet. What worked for you?',
        author: 'Sarah J.',
        category: 'Advice',
        likes: 12,
        likedBy: [],
        comments: [
            { id: 1, user: 'VetDr', text: 'Congratulations! Consistency is key for potty training.' },
            { id: 2, user: 'DogLover99', text: 'Make sure to get plenty of chew toys!' }
        ],
        createdAt: '2025-02-01T10:00:00Z',
        image: ''
    },
    {
        _id: 'p2',
        title: 'Found this little guy near Dharan',
        content: 'He was shivering and hungry. We took him in and he is doing much better now. Meet "Lucky"!',
        author: 'Rajesh K.',
        category: 'Story',
        likes: 45,
        likedBy: [],
        comments: [
            { id: 1, user: 'AnimalHero', text: 'Thank you for saving him!' },
            { id: 2, user: 'PawsNepal', text: 'He looks adorable. Let us know if you need vet assistance.' }
        ],
        createdAt: '2025-01-28T14:30:00Z',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr6F-UzVtnrqab7J3TANgQkWSJxMrojXj9WQ&s'
    },
    {
        _id: 'p3',
        title: 'Best vet clinic in Itahari?',
        content: 'My cat needs a dental checkup. Any recommendations for affordable and reliable vets in the Itahari area?',
        author: 'Anita S.',
        category: 'Question',
        likes: 8,
        likedBy: [],
        comments: [],
        createdAt: '2025-01-30T09:15:00Z',
        image: ''
    }
];

function Community() {
    const [posts, setPosts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General', image: '' });
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    // editing: { postId, commentId, text }
    const [editingComment, setEditingComment] = useState(null);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const currentUser = localStorage.getItem('loggedInUser') || 'Guest';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
        try {
            const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
            const normalizedLocalPosts = localPosts.map(p => ({
                ...p,
                comments: Array.isArray(p.comments) ? p.comments : [],
                likedBy: Array.isArray(p.likedBy) ? p.likedBy : []
            }));
            const allPosts = [...normalizedLocalPosts, ...MOCK_POSTS];
            setPosts(allPosts);
        } catch (err) {
            console.error(err);
            setPosts(MOCK_POSTS);
        }
    };

    const handleCreatePost = (e) => {
        e.preventDefault();
        const author = localStorage.getItem('loggedInUser') || 'Guest User';
        const newPostData = {
            _id: Date.now().toString(),
            ...newPost,
            author,
            likes: 0,
            likedBy: [],
            comments: [],
            createdAt: new Date().toISOString()
        };

        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        localStorage.setItem('communityPosts', JSON.stringify([newPostData, ...localPosts]));
        setPosts([newPostData, ...posts]);
        toast.success("Post published!");
        setShowModal(false);
        setNewPost({ title: '', content: '', category: 'General', image: '' });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setNewPost(prev => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleLike = (postId) => {
        if (!isAuthenticated) {
            toast.info("Please login to like posts");
            return;
        }

        const updatedPosts = posts.map(post => {
            if (post._id !== postId) return post;
            const likedBy = post.likedBy || [];
            const alreadyLiked = likedBy.includes(currentUser);
            return {
                ...post,
                likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
                likedBy: alreadyLiked ? likedBy.filter(u => u !== currentUser) : [...likedBy, currentUser]
            };
        });
        setPosts(updatedPosts);

        // Persist local posts
        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const updatedLocals = localPosts.map(p => {
            const updated = updatedPosts.find(u => u._id === p._id);
            return updated || p;
        });
        localStorage.setItem('communityPosts', JSON.stringify(updatedLocals));
    };

    const handleAddComment = (postId) => {
        if (!commentText.trim()) return;
        const user = localStorage.getItem('loggedInUser') || 'Guest';
        const newComment = { id: Date.now(), user, text: commentText };

        const updatedPosts = posts.map(post => {
            if (post._id !== postId) return post;
            return { ...post, comments: [...(post.comments || []), newComment] };
        });
        setPosts(updatedPosts);

        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const idx = localPosts.findIndex(p => p._id === postId);
        if (idx > -1) {
            localPosts[idx].comments = [...(localPosts[idx].comments || []), newComment];
            localStorage.setItem('communityPosts', JSON.stringify(localPosts));
        }
        setCommentText('');
        toast.success("Comment added!");
    };

    const handleDeleteComment = (postId, commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        const updatedPosts = posts.map(post => {
            if (post._id !== postId) return post;
            return { ...post, comments: post.comments.filter(c => c.id !== commentId) };
        });
        setPosts(updatedPosts);

        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const idx = localPosts.findIndex(p => p._id === postId);
        if (idx > -1) {
            localPosts[idx].comments = localPosts[idx].comments.filter(c => c.id !== commentId);
            localStorage.setItem('communityPosts', JSON.stringify(localPosts));
        }
        toast.success("Comment deleted");
    };

    const handleSaveEditComment = (postId, commentId) => {
        if (!editingComment?.text.trim()) return;
        const updatedPosts = posts.map(post => {
            if (post._id !== postId) return post;
            return {
                ...post,
                comments: post.comments.map(c =>
                    c.id === commentId ? { ...c, text: editingComment.text } : c
                )
            };
        });
        setPosts(updatedPosts);

        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const idx = localPosts.findIndex(p => p._id === postId);
        if (idx > -1) {
            localPosts[idx].comments = localPosts[idx].comments.map(c =>
                c.id === commentId ? { ...c, text: editingComment.text } : c
            );
            localStorage.setItem('communityPosts', JSON.stringify(localPosts));
        }
        setEditingComment(null);
        toast.success("Comment updated!");
    };

    const handleDeletePost = (postId) => {
        if (!window.confirm("Delete this post?")) return;
        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const updated = localPosts.filter(p => p._id !== postId);
        localStorage.setItem('communityPosts', JSON.stringify(updated));
        setPosts(posts.filter(p => p._id !== postId));
        toast.success("Post deleted");
    };

    const toggleComments = (postId) => {
        setExpandedPostId(expandedPostId === postId ? null : postId);
    };

    const filteredPosts = posts.filter(post => {
        const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="community-page container">
            {/* Hero Header */}
            <div className="community-header">
                <div className="header-content">
                    <h1>Community Forum</h1>
                    <p>Connect with fellow pet lovers, share stories, and seek advice.</p>
                    <button className="btn btn-primary btn-create" onClick={() => {
                        if (isAuthenticated) {
                            setShowModal(true);
                        } else {
                            toast.info("Please login to join the discussion");
                            navigate('/login');
                        }
                    }}>
                        <FaPen /> Start a Discussion
                    </button>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div className="forum-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="category-tabs">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
                {filteredPosts.length === 0 && (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem' }}>
                        <FaComment size={50} color="#ccc" />
                        <h3 style={{ color: '#aaa' }}>No posts found</h3>
                        <p>Be the first to start a discussion!</p>
                    </div>
                )}
                {filteredPosts.map(post => {
                    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
                    const likedBy = post.likedBy || [];
                    const hasLiked = likedBy.includes(currentUser);
                    const isOwner = post.author === currentUser;

                    return (
                        <div className="post-card" key={post._id}>
                            <div className="post-meta">
                                <div className="post-author-info">
                                    <FaUserCircle size={40} color="#ccc" />
                                    <div>
                                        <span className="author-name">{post.author}</span>
                                        <span className="post-date">
                                            {new Date(post.createdAt).toLocaleDateString()} •{' '}
                                            <span className="category-tag">{post.category}</span>
                                        </span>
                                    </div>
                                </div>
                                {isOwner && (
                                    <button className="delete-post-btn" onClick={() => handleDeletePost(post._id)} title="Delete post">
                                        <FaTrash color="#dc3545" />
                                    </button>
                                )}
                            </div>

                            <div className="post-body">
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-text">{post.content}</p>
                                {post.image && (
                                    <div className="post-image-container">
                                        <img src={post.image} alt="Post content" />
                                    </div>
                                )}
                            </div>

                            <div className="post-actions">
                                <button
                                    className={`action-btn ${hasLiked ? 'liked' : ''}`}
                                    onClick={() => handleLike(post._id)}
                                >
                                    <FaHeart /> {post.likes} Likes
                                </button>
                                <button className="action-btn" onClick={() => toggleComments(post._id)}>
                                    <FaComment /> {commentCount} Comments
                                </button>
                                <button className="action-btn" onClick={() => {
                                    navigator.clipboard?.writeText(window.location.href);
                                    toast.info("Link copied!");
                                }}>
                                    <FaShare /> Share
                                </button>
                            </div>

                            {/* Comments Section */}
                            {expandedPostId === post._id && (
                                <div className="comments-section">
                                    <div className="comments-list">
                                        {Array.isArray(post.comments) && post.comments.map((comment, idx) => {
                                            const isCommentOwner = comment.user === currentUser;
                                            const isEditing = editingComment?.postId === post._id && editingComment?.commentId === comment.id;
                                            return (
                                                <div key={idx} className="comment-item">
                                                    <div className="comment-header">
                                                        <strong className="comment-author">{comment.user}</strong>
                                                        {isCommentOwner && (
                                                            <div className="comment-actions">
                                                                <button
                                                                    className="comment-action-btn comment-edit-btn"
                                                                    title="Edit comment"
                                                                    onClick={() => setEditingComment({ postId: post._id, commentId: comment.id, text: comment.text })}
                                                                >
                                                                    <FaEdit size={12} />
                                                                </button>
                                                                <button
                                                                    className="comment-action-btn comment-delete-btn"
                                                                    title="Delete comment"
                                                                    onClick={() => handleDeleteComment(post._id, comment.id)}
                                                                >
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isEditing ? (
                                                        <div className="comment-edit-row">
                                                            <input
                                                                className="comment-edit-input"
                                                                value={editingComment.text}
                                                                onChange={e => setEditingComment({ ...editingComment, text: e.target.value })}
                                                                onKeyDown={e => e.key === 'Enter' && handleSaveEditComment(post._id, comment.id)}
                                                                autoFocus
                                                            />
                                                            <button className="comment-save-btn" onClick={() => handleSaveEditComment(post._id, comment.id)}>
                                                                <FaCheck size={12} /> Save
                                                            </button>
                                                            <button className="comment-cancel-btn" onClick={() => setEditingComment(null)}>
                                                                <FaTimes size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="comment-text">{comment.text}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {commentCount === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No comments yet. Be the first!</p>}
                                    </div>
                                    <div className="add-comment-box">
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                        />
                                        <button className="btn-send" onClick={() => handleAddComment(post._id)}>Post</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create Post Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Post</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreatePost}>
                            <input
                                type="text"
                                placeholder="Post Title *"
                                value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                required
                                className="input-field"
                            />
                            <select
                                value={newPost.category}
                                onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                className="input-field"
                            >
                                <option value="General">General</option>
                                <option value="Advice">Advice</option>
                                <option value="Story">Story</option>
                                <option value="Question">Question</option>
                            </select>

                            <div className="image-upload-area">
                                <label>Add Image (optional)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                {newPost.image && <img src={newPost.image} alt="Preview" className="image-preview" />}
                            </div>

                            <textarea
                                placeholder="What's on your mind? *"
                                rows="5"
                                value={newPost.content}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                required
                                className="input-field textarea-field"
                            ></textarea>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Publish Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .community-page { padding: 2rem; max-width: 900px; margin: 0 auto; }

                .community-header {
                    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1950&q=80');
                    background-size: cover; background-position: center;
                    color: white; padding: 4rem 2rem; border-radius: var(--radius-lg);
                    text-align: center; margin-bottom: 2rem; box-shadow: var(--shadow-md);
                }
                .community-header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
                .community-header p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
                .btn-create { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; font-size: 1.1rem; }

                .forum-controls {
                    display: flex; flex-wrap: wrap; gap: 1rem;
                    align-items: center; justify-content: space-between;
                    background: white; padding: 1rem 1.5rem;
                    border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
                    margin-bottom: 2rem;
                }
                .search-box {
                    position: relative; flex: 1; min-width: 200px;
                }
                .search-box input {
                    width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem;
                    border: 1px solid #ddd; border-radius: var(--radius-full); font-size: 0.95rem;
                }
                .search-icon {
                    position: absolute; left: 0.8rem; top: 50%;
                    transform: translateY(-50%); color: #aaa;
                }
                .category-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .cat-tab {
                    padding: 0.4rem 1rem; border-radius: var(--radius-full);
                    border: 1px solid #ddd; background: white;
                    cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
                }
                .cat-tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
                .cat-tab:hover:not(.active) { background: #f0f0f0; }

                .posts-feed { display: flex; flex-direction: column; gap: 2rem; }
                .post-card {
                    background: white; border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm); border: 1px solid var(--color-border);
                    overflow: hidden; transition: transform 0.2s;
                }
                .post-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

                .post-meta { padding: 1.5rem 1.5rem 0; display: flex; align-items: center; justify-content: space-between; }
                .post-author-info { display: flex; align-items: center; gap: 1rem; }
                .author-name { font-weight: 700; color: var(--color-text); display: block; }
                .post-date { font-size: 0.85rem; color: var(--color-text-light); }
                .category-tag { background: #EFEBE9; color: var(--color-primary-dark); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                .delete-post-btn { background: none; border: none; cursor: pointer; padding: 0.5rem; opacity: 0.6; transition: opacity 0.2s; }
                .delete-post-btn:hover { opacity: 1; }

                .post-body { padding: 1rem 1.5rem; }
                .post-title { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-primary-dark); }
                .post-text { line-height: 1.6; color: var(--color-text); margin-bottom: 1rem; white-space: pre-wrap; }
                .post-image-container { margin-top: 1rem; border-radius: var(--radius-md); overflow: hidden; max-height: 400px; }
                .post-image-container img { width: 100%; object-fit: cover; }

                .post-actions {
                    padding: 1rem 1.5rem; background: #f9f9f9;
                    display: flex; gap: 1.5rem; border-top: 1px solid var(--color-border);
                }
                .action-btn {
                    background: none; border: none; display: flex; align-items: center;
                    gap: 0.5rem; color: var(--color-text-light); font-weight: 600;
                    cursor: pointer; transition: color 0.2s;
                }
                .action-btn:hover { color: var(--color-primary); }
                .action-btn.liked { color: #dc3545; }

                .comments-section { background: #f1f2f3; padding: 1rem 1.5rem; border-top: 1px solid #e1e4e8; }
                .comment-item {
                    background: #fff; padding: 0.7rem 1rem; border-radius: 12px;
                    margin-bottom: 0.5rem; font-size: 0.9rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .comment-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 4px;
                }
                .comment-author { color: var(--color-primary-dark); font-size: 0.85rem; }
                .comment-text { margin: 0; color: #444; line-height: 1.5; }
                .comment-actions { display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s; }
                .comment-item:hover .comment-actions { opacity: 1; }
                .comment-action-btn {
                    background: none; border: none; cursor: pointer;
                    padding: 3px 5px; border-radius: 4px; transition: background 0.15s;
                    display: flex; align-items: center;
                }
                .comment-edit-btn { color: #5d4037; }
                .comment-edit-btn:hover { background: #f0e8e5; }
                .comment-delete-btn { color: #dc3545; }
                .comment-delete-btn:hover { background: #fff0ee; }
                .comment-edit-row { display: flex; gap: 6px; align-items: center; margin-top: 4px; }
                .comment-edit-input {
                    flex: 1; padding: 5px 10px; border-radius: 20px;
                    border: 1.5px solid var(--color-primary); font-size: 0.875rem;
                    outline: none;
                }
                .comment-save-btn {
                    display: flex; align-items: center; gap: 4px;
                    background: var(--color-primary); color: white; border: none;
                    padding: 5px 12px; border-radius: 20px; cursor: pointer;
                    font-size: 0.8rem; font-weight: 600;
                }
                .comment-cancel-btn {
                    background: none; border: none; cursor: pointer;
                    color: #888; padding: 4px 6px; border-radius: 50%;
                    font-size: 0.85rem; transition: background 0.15s;
                }
                .comment-cancel-btn:hover { background: #eee; }
                .add-comment-box { display: flex; gap: 0.5rem; margin-top: 1rem; }
                .add-comment-box input {
                    flex: 1; padding: 0.5rem 1rem; border-radius: 20px;
                    border: 1px solid #ddd; font-size: 0.9rem;
                }
                .btn-send {
                    background: var(--color-primary); color: white; border: none;
                    padding: 0 1rem; border-radius: 20px; cursor: pointer; font-weight: 600;
                }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal-content { background: white; width: 100%; max-width: 600px; border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-xl); animation: slideUp 0.3s ease; max-height: 90vh; overflow-y: auto; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { color: var(--color-primary-dark); margin: 0; }
                .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666; }
                .input-field { width: 100%; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box; }
                .input-field:focus { outline: none; border-color: var(--color-primary); }
                .textarea-field { resize: vertical; min-height: 150px; }
                .image-upload-area { margin-bottom: 1rem; }
                .image-upload-area label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
                .image-preview { width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-top: 0.5rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
                .btn-text { background: none; border: none; padding: 0.8rem 1.5rem; font-weight: 600; color: #666; cursor: pointer; }
            `}</style>
        </div>
    );
}

export default Community;
