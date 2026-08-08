import { useState } from 'react';
import { ArrowBigUp, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PostCard.css';

export default function PostCard({ postObj, onDeleteSuccess }) {
  const { user, token, apiBaseUrl } = useAuth();
  const { Post: postData, votes: initialVotes } = postObj;
  
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false); // local toggle state
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleVote = async () => {
    if (!user) {
      setError('Please login to vote.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (voting) return;
    setVoting(true);

    try {
      // If we think we haven't voted, we try to upvote (dir: true).
      // If we think we have voted, we try to unvote (dir: false).
      const direction = !hasVoted;
      
      const res = await fetch(`${apiBaseUrl}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: postData.id,
          dir: direction,
        }),
      });

      if (res.status === 409) {
        // Conflict: User already voted but local state was out of sync.
        // Let's call it with dir: false to unvote instead.
        const unvoteRes = await fetch(`${apiBaseUrl}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            post_id: postData.id,
            dir: false,
          }),
        });

        if (unvoteRes.ok) {
          setVotes((prev) => Math.max(0, prev - 1));
          setHasVoted(false);
        }
      } else if (res.status === 404) {
        // Vote not found: user tried to unvote but hadn't voted.
        // Try to upvote instead.
        const voteRes = await fetch(`${apiBaseUrl}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            post_id: postData.id,
            dir: true,
          }),
        });

        if (voteRes.ok) {
          setVotes((prev) => prev + 1);
          setHasVoted(true);
        }
      } else if (res.ok) {
        // Success
        setVotes((prev) => (direction ? prev + 1 : Math.max(0, prev - 1)));
        setHasVoted(direction);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Vote operation failed');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Connection error');
      setTimeout(() => setError(null), 3000);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/posts/${postData.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (onDeleteSuccess) {
          onDeleteSuccess(postData.id);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Delete failed');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Connection error');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleting(false);
    }
  };

  // Determine if current user is the owner
  const isOwner = user && user.id === postData.owner_id;

  return (
    <div className="post-card glass-panel fade-in">
      <div className="post-vote-section">
        <button 
          onClick={handleVote} 
          className={`vote-btn ${hasVoted ? 'voted' : ''}`}
          disabled={voting}
          title={hasVoted ? 'Remove Vote' : 'Upvote'}
        >
          <ArrowBigUp size={28} className="vote-icon" />
        </button>
        <span className="vote-count">{votes}</span>
      </div>

      <div className="post-content-section">
        <div className="post-header">
          <div className="post-author">
            <User size={14} className="author-icon" />
            <span>{postData.owner?.email || 'Anonymous'}</span>
          </div>
          {isOwner && (
            <button 
              onClick={handleDelete} 
              className="btn-delete" 
              disabled={deleting}
              title="Delete Post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <h3 className="post-title">{postData.title}</h3>
        <p className="post-body">{postData.content}</p>
        
        {error && <span className="post-error">{error}</span>}
      </div>
    </div>
  );
}
