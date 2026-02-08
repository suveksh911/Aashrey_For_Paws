import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPen, FaUserCircle, FaHeart, FaComment, FaShare, FaTimes } from 'react-icons/fa';

const MOCK_POSTS = [
    {
        _id: 'p1',
        title: 'Tips for first-time dog owners?',
        content: 'I just adopted a 2-month-old Golden Retriever! Looking for advice on potty training and diet. What worked for you?',
        author: 'Sarah J.',
        category: 'Advice',
        likes: 12,
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

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];

            const normalizedLocalPosts = localPosts.map(p => ({
                ...p,
                comments: Array.isArray(p.comments) ? p.comments : []
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
        const author = localStorage.getItem('loggedInUser') || (isAuthenticated ? 'User' : 'Guest User');

        const newPostData = {
            _id: Date.now().toString(),
            ...newPost,
            author,
            likes: 0,
            comments: [],
            createdAt: new Date().toISOString()
        };

        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const updatedLocalPosts = [newPostData, ...localPosts];
        localStorage.setItem('communityPosts', JSON.stringify(updatedLocalPosts));


        setPosts([newPostData, ...posts]);

        toast.success("Post published!");
        setShowModal(false);
        setNewPost({ title: '', content: '', category: 'General', image: '' });
    };

    const handleAddComment = (postId) => {
        if (!commentText.trim()) return;
        const user = localStorage.getItem('loggedInUser') || 'Guest';

        const newComment = {
            id: Date.now(),
            user,
            text: commentText
        };


        const updatedPosts = posts.map(post => {
            if (post._id === postId) {
                const currentComments = Array.isArray(post.comments) ? post.comments : [];
                return { ...post, comments: [...currentComments, newComment] };
            }
            return post;
        });

        setPosts(updatedPosts);


        const localPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        const postIndex = localPosts.findIndex(p => p._id === postId);
        if (postIndex > -1) {
            const currentComments = Array.isArray(localPosts[postIndex].comments) ? localPosts[postIndex].comments : [];
            localPosts[postIndex].comments = [...currentComments, newComment];
            localStorage.setItem('communityPosts', JSON.stringify(localPosts));
        }

        setCommentText('');
        toast.success("Comment added!");
    };

    const toggleComments = (postId) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
        }
    };

    return (
        <div className="community-page container">
            { }
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

            { }
            <div className="posts-feed">
                {posts.map(post => {
                    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

                    return (
                        <div className="post-card" key={post._id}>
                            <div className="post-meta">
                                <div className="post-author-info">
                                    <FaUserCircle size={40} color="#ccc" />
                                    <div>
                                        <span className="author-name">{post.author}</span>
                                        <span className="post-date">{new Date(post.createdAt).toLocaleDateString()} • <span className="category-tag">{post.category}</span></span>
                                    </div>
                                </div>
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
                                <button className="action-btn">
                                    <FaHeart /> {post.likes} Likes
                                </button>
                                <button className="action-btn" onClick={() => toggleComments(post._id)}>
                                    <FaComment /> {commentCount} Comments
                                </button>
                                <button className="action-btn">
                                    <FaShare /> Share
                                </button>
                            </div>

                            { }
                            {expandedPostId === post._id && (
                                <div className="comments-section">
                                    <div className="comments-list">
                                        {Array.isArray(post.comments) && post.comments.map((comment, idx) => (
                                            <div key={idx} className="comment-item">
                                                <strong>{comment.user}: </strong> {comment.text}
                                            </div>
                                        ))}
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

            { }
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
                                placeholder="Post Title"
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

                            <input
                                type="text"
                                placeholder="Image URL (Optional)"
                                value={newPost.image}
                                onChange={e => setNewPost({ ...newPost, image: e.target.value })}
                                className="input-field"
                            />

                            <textarea
                                placeholder="What's on your mind?"
                                rows="5"
                                value={newPost.content}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                required
                                className="input-field textarea-field"
                            ></textarea>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .comments-section {
                    background: #f1f2f3;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e1e4e8;
                }
                .comment-item {
                    background: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .add-comment-box {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .add-comment-box input {
                    flex: 1;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    border: 1px solid #ddd;
                    font-size: 0.9rem;
                }
                .btn-send {
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 0 1rem;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 600;
                }
            `}</style>


            <style>{`
                .community-page { padding: 2rem; max-width: 900px; margin: 0 auto; }
                
                /* Hero */
                .community-header {
                    background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1950&q=80');
                    background-size: cover;
                    background-position: center;
                    color: white;
                    padding: 4rem 2rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                    margin-bottom: 3rem;
                    box-shadow: var(--shadow-md);
                }
                .community-header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
                .community-header p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
                .btn-create { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; font-size: 1.1rem; }

                /* Feed */
                .posts-feed { display: flex; flex-direction: column; gap: 2rem; }
                .post-card {
                    background: white;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--color-border);
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                .post-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
                
                .post-meta { padding: 1.5rem 1.5rem 0; display: flex; align-items: center; justify-content: space-between; }
                .post-author-info { display: flex; align-items: center; gap: 1rem; }
                .author-name { font-weight: 700; color: var(--color-text); display: block; }
                .post-date { font-size: 0.85rem; color: var(--color-text-light); }
                .category-tag { background: #EFEBE9; color: var(--color-primary-dark); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem; }

                .post-body { padding: 1rem 1.5rem; }
                .post-title { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-primary-dark); }
                .post-text { line-height: 1.6; color: var(--color-text); font-size: 1rem; margin-bottom: 1rem; white-space: pre-wrap; }
                .post-image-container { margin-top: 1rem; border-radius: var(--radius-md); overflow: hidden; max-height: 400px; }
                .post-image-container img { width: 100%; height: 100%; object-fit: cover; }

                .post-actions {
                    padding: 1rem 1.5rem;
                    background: #f9f9f9;
                    display: flex;
                    gap: 1.5rem;
                    border-top: 1px solid var(--color-border);
                }
                .action-btn {
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--color-text-light);
                    font-weight: 600;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .action-btn:hover { color: var(--color-primary); }

                /* Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal-content { background: white; width: 100%; max-width: 600px; border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-xl); animation: slideUp 0.3s ease; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .modal-header h2 { color: var(--color-primary-dark); margin: 0; }
                .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666; }
                
                .input-field { width: 100%; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 1rem; transition: border-color 0.2s; }
                .input-field:focus { outline: none; border-color: var(--color-primary); }
                .textarea-field { resize: vertical; min-height: 150px; }
                
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
                .btn-text { background: none; border: none; padding: 0.8rem 1.5rem; font-weight: 600; color: #666; cursor: pointer; }
                .btn-text:hover { color: var(--color-text); }
            `}</style>
        </div>
    );
}

export default Community;
