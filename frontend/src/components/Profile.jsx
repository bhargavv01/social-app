import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import SkeletonCard from './SkeletonCard';
import { User, Sparkles, AlertCircle } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, apiBaseUrl } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchMyPosts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/posts`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      const myPosts = data
        .filter((item) => item.Post.owner_id === user.id)
        .sort((a, b) => b.Post.id - a.Post.id);
      setPosts(myPosts);
    } catch (err) {
      setError('Failed to load your posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyPosts(); }, [user]);

  const handleDeleteSuccess = (deletedPostId) => {
    setPosts((prev) => prev.filter((item) => item.Post.id !== deletedPostId));
  };

  const handleUpdateSuccess = (postId, updatedPost) => {
    setPosts((prev) =>
      prev.map((item) =>
        item.Post.id === postId
          ? { ...item, Post: { ...item.Post, ...updatedPost } }
          : item
      )
    );
  };

  if (!user) return null;

  return (
    <div className="profile-container container fade-in">
      <div className="profile-header-card glass-panel">
        <div className="profile-avatar-container">
          <div className="profile-avatar flex-center">
            <User size={48} className="avatar-icon" />
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-badge">
            <Sparkles size={12} />
            <span>Member</span>
          </div>
          <h2 className="profile-email">{user.email}</h2>
          <p className="profile-stats">
            You have published <strong className="stat-count">{posts.length}</strong> {posts.length === 1 ? 'post' : 'posts'}.
          </p>
        </div>
      </div>

      <div className="profile-section-title">
        <h3>My Posts</h3>
      </div>

      {loading ? (
        <div className="posts-list">
          {[1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="profile-state-message error-message glass-panel">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="profile-state-message empty-state glass-panel">
          <p>You haven't written any posts yet.</p>
          <button onClick={() => navigate('/create-post')} className="btn btn-primary mt-2">
            Create First Post
          </button>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((postObj) => (
            <PostCard
              key={postObj.Post.id}
              postObj={postObj}
              onDeleteSuccess={handleDeleteSuccess}
              onUpdateSuccess={handleUpdateSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
