import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import SkeletonCard from './SkeletonCard';
import { Search, Sparkles, MessageSquare, ArrowLeft, ArrowRight, ArrowUpDown, Clock } from 'lucide-react';
import './Feed.css';

const LIMIT = 6;

export default function Feed() {
  const { apiBaseUrl } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServerNotice, setShowServerNotice] = useState(false);
  const [error, setError] = useState(null);
  
  // Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to first page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = useCallback(async () => {
    let noticeTimer;
    try {
      setLoading(true);
      setError(null);

      // Show "Waking up server..." notice if request takes >2.5s
      noticeTimer = setTimeout(() => {
        setShowServerNotice(true);
      }, 2500);

      const skip = (page - 1) * LIMIT;
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        skip: skip.toString(),
        sort_by: sortBy,
      });
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const res = await fetch(`${apiBaseUrl}/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve posts');
      const data = await res.json();
      
      setPosts(data);
      setHasMore(data.length === LIMIT);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend. Render free tier servers take ~40 seconds to wake up. Click below to retry.');
    } finally {
      clearTimeout(noticeTimer);
      setShowServerNotice(false);
      setLoading(false);
    }
  }, [apiBaseUrl, page, sortBy, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

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
          An interactive feed with real-time voting, search filtering, and pagination.
        </p>
      </header>

      <div className="controls-row">
        <div className="search-bar-container glass-panel">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search posts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-container glass-panel">
          <ArrowUpDown size={16} className="sort-icon" />
          <select value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="latest">Latest First</option>
            <option value="votes">Most Voted</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {showServerNotice && loading && (
        <div className="wakeup-banner glass-panel fade-in">
          <Clock className="loading-spinner" size={20} />
          <div>
            <strong>Connecting & Waking Up Backend Server...</strong>
            <p>Render free servers sleep after inactivity. Initial wakeup takes 30-40 seconds. Thank you for your patience!</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="posts-list">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="feed-state-message error-message glass-panel">
          <p>{error}</p>
          <button onClick={fetchPosts} className="btn btn-secondary mt-4">
            Retry Connection
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="feed-state-message empty-state glass-panel">
          <MessageSquare size={48} className="empty-icon" />
          <h3>No posts found</h3>
          <p>
            {debouncedSearch
              ? `No matching results for "${debouncedSearch}". Try another query.`
              : 'Be the first to share a post with the community!'}
          </p>
        </div>
      ) : (
        <>
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

          <div className="pagination-bar glass-panel">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="btn btn-secondary pagination-btn"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="pagination-info">
              Page <strong>{page}</strong>
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || loading}
              className="btn btn-secondary pagination-btn"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
