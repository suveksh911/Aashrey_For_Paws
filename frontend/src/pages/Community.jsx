import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function Community() {
    const [posts, setPosts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/posts');
            const result = await response.json();
            if (result.success) setPosts(result.data);
        } catch (err) { console.error(err); }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const author = localStorage.getItem('loggedInUser') || 'Anonymous';
        try {
            const response = await fetch('http://localhost:5000/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPost, author })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Post created!");
                setShowModal(false);
                setNewPost({ title: '', content: '' });
                fetchPosts();
            } else {
                toast.error("Failed to create post");
            }
        } catch (err) { toast.error("Error creating post"); }
    };

    return (
        <div className="community-page container">
            <h1 className="page-title">Community Forum</h1>
            <div className="forum-header">
                <p>Join the conversation. Share your stories, ask advice, and connect with other pet lovers.</p>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create New Post</button>
            </div>

            <div className="posts-container">
                {posts.map(post => (
                    <div className="post-card" key={post._id}>
                        <div className="post-header">
                            <h3>{post.title}</h3>
                            <span className="author">By {post.author}</span>
                        </div>
                        {post.image && (
                            <img src={post.image} alt="Post Attachment" className="post-image" />
                        )}
                        <p className="post-content">{post.content}</p>
                        <div className="post-footer">
                            <span>Posted on {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Post</h2>
                        <form onSubmit={handleCreatePost}>
                            <input type="text" placeholder="Title" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} required />
                            <input type="text" placeholder="Image URL (Optional)" value={newPost.image} onChange={e => setNewPost({ ...newPost, image: e.target.value })} />
                            <textarea placeholder="Share something..." rows="5" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} required></textarea>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .community-page { padding: 4rem 1rem; }
                .forum-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; background: var(--color-surface); padding: 2rem; border-radius: var(--radius-lg); }
                .forum-header p { max-width: 600px; color: var(--color-text-light); }
                
                .posts-container { display: flex; flex-direction: column; gap: 1.5rem; }
                .post-card { background: var(--color-surface); padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
                .post-header { display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }
                .post-header h3 { color: var(--color-primary-dark); }
                .author { color: var(--color-primary); font-weight: 500; }
                .post-image { max-width: 100%; max-height: 400px; border-radius: var(--radius-md); margin-bottom: 1rem; object-fit: cover; }
                .post-content { line-height: 1.6; color: var(--color-text); margin-bottom: 1rem; }
                .post-footer { font-size: 0.85rem; color: var(--color-text-light); text-align: right; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background: var(--color-surface); padding: 2rem; border-radius: var(--radius-lg); width: 100%; max-width: 500px; }
                .modal-content h2 { margin-bottom: 1.5rem; color: var(--color-primary-dark); }
                .modal-content form { display: flex; flex-direction: column; gap: 1rem; }
                .modal-content input, .modal-content textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

                @media (max-width: 768px) { .forum-header { flex-direction: column; gap: 1rem; text-align: center; } }
            `}</style>
        </div>
    );
}

export default Community;
