import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import { Search, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import './Feed.css';

export default function Feed() {
  const { apiBaseUrl } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/posts`);
      if (!res.ok) {
        throw new Error('Failed to retrieve posts');
      }
      const data = await res.json();
      // Sort posts by ID descending (newest first)
      const sorted = data.sort((a, b) => b.Post.id - a.Post.id);
      setPosts(sorted);
      setFilteredPosts(sorted);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(
      (item) =>
        item.Post.title.toLowerCase().includes(query) ||
        item.Post.content.toLowerCase().includes(query) ||
        item.Post.owner.email.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const handleDeleteSuccess = (deletedPostId) => {
    setPosts((prev) => prev.filter((item) => item.Post.id !== deletedPostId));
  };

  return (
    <div className="feed-container container fade-in">
      <header className="feed-header text-center">
        <div className="welcome-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Explore what's happening</span>
        </div>
        <h1 className="feed-title">
          Share your vibes, <span className="gradient-text">connect with others</span>
        </h1>
        <p className="feed-subtitle">
          An interactive feed designed for sharing thoughts and voting on engaging content.
        </p>
      </header>

      <div className="search-bar-container glass-panel">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search posts, descriptions, or authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="feed-state-message">
          <Loader2 className="loading-spinner" size={40} />
          <p>Loading posts...</p>
        </div>
      ) : error ? (
        <div className="feed-state-message error-message glass-panel">
          <p>{error}</p>
          <button onClick={fetchPosts} className="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="feed-state-message empty-state glass-panel">
          <MessageSquare size={48} className="empty-icon" />
          <h3>No posts found</h3>
          <p>Be the first to share a post with the community!</p>
        </div>
      ) : (
        <div className="posts-list">
          {filteredPosts.map((postObj) => (
            <PostCard
              key={postObj.Post.id}
              postObj={postObj}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
