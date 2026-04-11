import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios';
import { FaPen, FaUserCircle, FaHeart, FaComment, FaShare, FaTimes, FaSearch, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';

const CATEGORIES = ['All', 'General', 'Advice', 'Story', 'Question'];

function Community() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General', image: '' });
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { fetchPosts(); }, [activeCategory]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = activeCategory !== 'All' ? { category: activeCategory } : {};
            const res = await api.get('/posts', { params });
            if (res.data.success) setPosts(res.data.data);
        } catch {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/posts', newPost);
            if (res.data.success) {
                setPosts(prev => [res.data.data, ...prev]);
                toast.success('Post published!');
                setShowModal(false);
                setNewPost({ title: '', content: '', category: 'General', image: '' });
            }
        } catch {
            toast.error('Failed to publish post');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setNewPost(prev => ({ ...prev, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleLike = async (postId) => {
        if (!isAuthenticated) { toast.info('Please login to like posts'); return; }
        try {
            const res = await api.post(`/posts/${postId}/like`);
            if (res.data.success) {
                setPosts(prev => prev.map(p =>
                    p._id === postId ? { ...p, likes: res.data.data.likes, likedBy: res.data.data.likedBy } : p
                ));
            }
        } catch { toast.error('Failed to update like'); }
    };

    const handleAddComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            const res = await api.post(`/posts/${postId}/comment`, { text: commentText });
            if (res.data.success) {
                setPosts(prev => prev.map(p =>
                    p._id === postId ? { ...p, comments: [...(p.comments || []), res.data.data] } : p
                ));
                setCommentText('');
                toast.success('Comment added!');
            }
        } catch { toast.error('Failed to add comment'); }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/posts/${postId}/comment/${commentId}`);
            setPosts(prev => prev.map(p =>
                p._id === postId ? { ...p, comments: p.comments.filter(c => c._id !== commentId) } : p
            ));
            toast.success('Comment deleted');
        } catch { toast.error('Failed to delete comment'); }
    };

    const handleEditCommentSave = async (postId, commentId) => {
        const trimmedText = editingCommentText.trim();
        if (!trimmedText) return;

        const post = posts.find(p => p._id === postId);
        const commentToEdit = post?.comments.find(c => c._id === commentId);

        if (commentToEdit && commentToEdit.text === trimmedText) {
            setEditingCommentId(null);
            setEditingCommentText('');
            return;
        }

        try {
            const res = await api.put(`/posts/${postId}/comment/${commentId}`, { text: trimmedText });
            if (res.data.success) {
                setPosts(prev => prev.map(p =>
                    p._id === postId ? { ...p, comments: p.comments.map(c => c._id === commentId ? { ...c, text: res.data.data.text } : c) } : p
                ));
                setEditingCommentId(null);
                setEditingCommentText('');
                toast.success('Comment updated');
            }
        } catch { toast.error('Failed to update comment'); }
    };

    const handleLikeComment = async (postId, commentId) => {
        if (!isAuthenticated) { toast.info('Please login to like'); return; }
        try {
            const res = await api.post(`/posts/${postId}/comment/${commentId}/like`);
            if (res.data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? {
                    ...p,
                    comments: p.comments.map(c => c._id === commentId ? { ...c, likes: res.data.data.likes, likedBy: res.data.data.likedBy } : c)
                } : p));
            }
        } catch { toast.error('Failed to update like'); }
    };

    const handleReplyComment = async (postId, commentId) => {
        if (!replyText.trim()) return;
        try {
            const res = await api.post(`/posts/${postId}/comment/${commentId}/reply`, { text: replyText });
            if (res.data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? {
                    ...p,
                    comments: p.comments.map(c => c._id === commentId ? { ...c, replies: [...(c.replies || []), res.data.data] } : c)
                } : p));
                setReplyText('');
                setReplyingToCommentId(null);
                toast.success('Reply added!');
            }
        } catch { toast.error('Failed to add reply'); }
    };

    const handleLikeReply = async (postId, commentId, replyId) => {
        if (!isAuthenticated) { toast.info('Please login to like'); return; }
        try {
            const res = await api.post(`/posts/${postId}/comment/${commentId}/reply/${replyId}/like`);
            if (res.data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? {
                    ...p,
                    comments: p.comments.map(c => c._id === commentId ? {
                        ...c,
                        replies: (c.replies || []).map(r => r._id === replyId ? { ...r, likes: res.data.data.likes, likedBy: res.data.data.likedBy } : r)
                    } : c)
                } : p));
            }
        } catch { toast.error('Failed to update reply like'); }
    };

    const handleDeleteReply = async (postId, commentId, replyId) => {
        if (!window.confirm('Delete this reply?')) return;
        try {
            await api.delete(`/posts/${postId}/comment/${commentId}/reply/${replyId}`);
            setPosts(prev => prev.map(p => p._id === postId ? {
                ...p,
                comments: p.comments.map(c => c._id === commentId ? {
                    ...c,
                    replies: (c.replies || []).filter(r => r._id !== replyId)
                } : c)
            } : p));
            toast.success('Reply deleted');
        } catch { toast.error('Failed to delete reply'); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
            toast.success('Post deleted');
        } catch { toast.error('Failed to delete post'); }
    };

    const toggleComments = (postId) => setExpandedPostId(expandedPostId === postId ? null : postId);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const currentUserEmail = user?.email || '';

    return (
        <div className="community-page container">
            <div className="community-header">
                <div className="header-content">
                    <h1>Community Forum</h1>
                    <p>Connect with fellow pet lovers, share stories, and seek advice.</p>
                    <button className="btn btn-primary btn-create" onClick={() => {
                        if (isAuthenticated) setShowModal(true);
                        else { toast.info('Please login to join the discussion'); navigate('/login'); }
                    }}>
                        <FaPen /> Start a Discussion
                    </button>
                </div>
            </div>

            <div className="forum-controls">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search posts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="category-tabs">
                    {CATEGORIES.map(cat => (
                        <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}>{cat}</button>
                    ))}
                </div>
            </div>

            <div className="posts-feed">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>Loading posts…</p>
                ) : filteredPosts.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem' }}>
                        <FaComment size={50} color="#ccc" />
                        <h3 style={{ color: '#aaa' }}>No posts found</h3>
                        <p>Be the first to start a discussion!</p>
                    </div>
                ) : filteredPosts.map(post => {
                    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
                    const hasLiked = currentUserEmail && (post.likedBy || []).includes(currentUserEmail);
                    const isOwner = post.authorId === user?._id || post.author === user?.name;

                    return (
                        <div className="post-card" id={`post-${post._id}`} key={post._id}>
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
                                    <button className="delete-post-btn" onClick={() => handleDeletePost(post._id)}>
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
                                <button className={`action-btn ${hasLiked ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                                    <FaHeart /> {post.likes} Likes
                                </button>
                                <button className="action-btn" onClick={() => toggleComments(post._id)}>
                                    <FaComment /> {commentCount} Comments
                                </button>
                                <button className="action-btn" onClick={() => { 
                                    const url = window.location.href.split('#')[0] + `#post-${post._id}`;
                                    navigator.clipboard?.writeText(url); 
                                    toast.info('Link copied!'); 
                                }}>
                                    <FaShare /> Share
                                </button>
                            </div>

                            {expandedPostId === post._id && (
                                <div className="comments-section">
                                    <div className="comments-list">
                                        {Array.isArray(post.comments) && post.comments.map((comment) => {
                                            const isCommentOwner = comment.userId === user?._id || comment.user === user?.name;
                                            const isEditing = editingCommentId === comment._id;
                                            return (
                                                <div key={comment._id} className="comment-item">
                                                    <div className="comment-header">
                                                        <strong className="comment-author">{comment.user}</strong>
                                                        {isCommentOwner && (
                                                            <div className="comment-actions">
                                                                <button className="comment-action-btn" title="Edit comment"
                                                                    onClick={() => { setEditingCommentId(comment._id); setEditingCommentText(comment.text); }}>
                                                                    <FaEdit size={12} color="#555" />
                                                                </button>
                                                                <button className="comment-action-btn comment-delete-btn" title="Delete comment"
                                                                    onClick={() => handleDeleteComment(post._id, comment._id)}>
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                            <input type="text" value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} 
                                                                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                                autoFocus
                                                                onKeyDown={(e) => { if (e.key === 'Enter') handleEditCommentSave(post._id, comment._id); else if (e.key === 'Escape') setEditingCommentId(null); }} />
                                                            <button className="btn btn-primary" style={{ padding: '0 8px' }} onClick={() => handleEditCommentSave(post._id, comment._id)}><FaCheck /></button>
                                                            <button className="btn btn-secondary" style={{ padding: '0 8px' }} onClick={() => setEditingCommentId(null)}><FaTimes /></button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="comment-text">{comment.text}</p>
                                                            <div className="comment-footer" style={{ marginTop: '8px', display: 'flex', gap: '15px', color: '#888', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                <button style={{ background: 'none', border: 'none', color: (comment.likedBy || []).includes(user?.email) ? '#dc3545' : 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} 
                                                                    onClick={() => handleLikeComment(post._id, comment._id)}>
                                                                    <FaHeart size={10} /> {comment.likes || 0}
                                                                </button>
                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                                                    onClick={() => setReplyingToCommentId(replyingToCommentId === comment._id ? null : comment._id)}>
                                                                    Reply
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Nested Replies */}
                                                    {(comment.replies || []).length > 0 && (
                                                        <div className="comment-replies" style={{ marginTop: '12px', paddingLeft: '15px', borderLeft: '2px solid #eee' }}>
                                                            {comment.replies.map(r => {
                                                                const isReplyOwner = r.userId === user?._id || r.user === user?.name;
                                                                const isReplyLiked = (r.likedBy || []).includes(user?.email);
                                                                return (
                                                                    <div key={r._id} style={{ background: '#f8f9fa', padding: '6px 12px', borderRadius: '8px', marginBottom: '6px' }}>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <strong style={{ fontSize: '0.8rem', color: '#6d4c41' }}>{r.user}</strong>
                                                                            {isReplyOwner && (
                                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteReply(post._id, comment._id, r._id)}>
                                                                                    <FaTrash size={10} color="#dc3545" opacity={0.6} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#444' }}>{r.text}</p>
                                                                        <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#888', display: 'flex', gap: '10px' }}>
                                                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: isReplyLiked ? '#dc3545' : 'inherit', display: 'flex', alignItems: 'center', gap: '2px' }}
                                                                                onClick={() => handleLikeReply(post._id, comment._id, r._id)}>
                                                                                <FaHeart size={8} /> {r.likes || 0}
                                                                            </button>
                                                                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Reply Input */}
                                                    {replyingToCommentId === comment._id && (
                                                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                                            <input type="text" placeholder={`Reply to ${comment.user}...`} value={replyText} 
                                                                onChange={e => setReplyText(e.target.value)} 
                                                                style={{ flex: 1, padding: '5px 10px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                                                autoFocus
                                                                onKeyDown={e => e.key === 'Enter' && handleReplyComment(post._id, comment._id)} />
                                                            <button style={{ padding: '0 12px', fontSize: '0.8rem' }} className="btn btn-primary" onClick={() => handleReplyComment(post._id, comment._id)}>Send</button>
                                                            <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setReplyingToCommentId(null)}>Cancel</button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {commentCount === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No comments yet. Be the first!</p>}
                                    </div>
                                    <div className="add-comment-box">
                                        <input type="text" placeholder="Write a comment..." value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)} />
                                        <button className="btn-send" onClick={() => handleAddComment(post._id)}>Post</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Post</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreatePost}>
                            <input type="text" placeholder="Post Title *" value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })} required className="input-field" />
                            <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} className="input-field">
                                <option>General</option><option>Advice</option><option>Story</option><option>Question</option>
                            </select>
                            <div className="image-upload-area">
                                <label>Add Image (optional)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                {newPost.image && <img src={newPost.image} alt="Preview" className="image-preview" />}
                            </div>
                            <textarea placeholder="What's on your mind? *" rows="5" value={newPost.content}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })} required className="input-field textarea-field" />
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
                .community-header { background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1950&q=80'); background-size: cover; background-position: center; color: white; padding: 4rem 2rem; border-radius: var(--radius-lg); text-align: center; margin-bottom: 2rem; box-shadow: var(--shadow-md); }
                .community-header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
                .community-header p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
                .btn-create { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; font-size: 1.1rem; }
                .forum-controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; background: white; padding: 1rem 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: 2rem; }
                .search-box { position: relative; flex: 1; min-width: 200px; }
                .search-box input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; border: 1px solid #ddd; border-radius: var(--radius-full); font-size: 0.95rem; }
                .search-icon { position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: #aaa; }
                .category-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .cat-tab { padding: 0.4rem 1rem; border-radius: var(--radius-full); border: 1px solid #ddd; background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
                .cat-tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
                .posts-feed { display: flex; flex-direction: column; gap: 2rem; }
                .post-card { background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); overflow: hidden; transition: transform 0.2s; }
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
                .post-image-container { margin-top: 1rem; border-radius: var(--radius-md); overflow: hidden; max-height: 650px; background: #f0f0f0; display: flex; justify-content: center; align-items: center; }
                .post-image-container img { width: 100%; max-height: 650px; object-fit: contain; }
                .post-actions { padding: 1rem 1.5rem; background: #f9f9f9; display: flex; gap: 1.5rem; border-top: 1px solid var(--color-border); }
                .action-btn { background: none; border: none; display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-light); font-weight: 600; cursor: pointer; transition: color 0.2s; }
                .action-btn:hover { color: var(--color-primary); }
                .action-btn.liked { color: #dc3545; }
                .comments-section { background: #f1f2f3; padding: 1rem 1.5rem; border-top: 1px solid #e1e4e8; }
                .comment-item { background: #fff; padding: 0.7rem 1rem; border-radius: 12px; margin-bottom: 0.5rem; font-size: 0.9rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .comment-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
                .comment-author { color: var(--color-primary-dark); font-size: 0.85rem; }
                .comment-text { margin: 0; color: #444; line-height: 1.5; }
                .comment-actions { display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s; }
                .comment-item:hover .comment-actions { opacity: 1; }
                .comment-action-btn { background: none; border: none; cursor: pointer; padding: 3px 5px; border-radius: 4px; display: flex; align-items: center; }
                .comment-delete-btn { color: #dc3545; }
                .comment-delete-btn:hover { background: #fff0ee; }
                .add-comment-box { display: flex; gap: 0.5rem; margin-top: 1rem; }
                .add-comment-box input { flex: 1; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid #ddd; font-size: 0.9rem; }
                .btn-send { background: var(--color-primary); color: white; border: none; padding: 0 1rem; border-radius: 20px; cursor: pointer; font-weight: 600; }
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
