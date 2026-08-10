import { useState } from 'react';
import { ArrowBigUp, Trash2, User, Pencil, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getRelativeTime } from '../utils/timeUtils';
import './PostCard.css';

export default function PostCard({ postObj, onDeleteSuccess, onUpdateSuccess }) {
  const { user, token, apiBaseUrl } = useAuth();
  const { addToast } = useToast();
  const { Post: postData, votes: initialVotes } = postObj;

  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(postData.title);
  const [editContent, setEditContent] = useState(postData.content);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const handleVote = async () => {
    if (!user) {
      addToast('Please login to vote.', 'error');
      return;
    }
    if (voting) return;
    setVoting(true);

    try {
      const direction = !hasVoted;
      const res = await fetch(`${apiBaseUrl}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postData.id, dir: direction }),
      });

      if (res.status === 409) {
        const unvoteRes = await fetch(`${apiBaseUrl}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ post_id: postData.id, dir: false }),
        });
        if (unvoteRes.ok) {
          setVotes((prev) => Math.max(0, prev - 1));
          setHasVoted(false);
          addToast('Vote removed', 'info');
        }
      } else if (res.status === 404) {
        const voteRes = await fetch(`${apiBaseUrl}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ post_id: postData.id, dir: true }),
        });
        if (voteRes.ok) {
          setVotes((prev) => prev + 1);
          setHasVoted(true);
          addToast('Vote added!', 'success');
        }
      } else if (res.ok) {
        setVotes((prev) => (direction ? prev + 1 : Math.max(0, prev - 1)));
        setHasVoted(direction);
        addToast(direction ? 'Vote added!' : 'Vote removed', direction ? 'success' : 'info');
      } else {
        const errorData = await res.json();
        addToast(errorData.detail || 'Vote failed', 'error');
      }
    } catch (err) {
      addToast('Connection error', 'error');
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        addToast('Post deleted successfully', 'success');
        if (onDeleteSuccess) onDeleteSuccess(postData.id);
      } else {
        const errorData = await res.json();
        addToast(errorData.detail || 'Delete failed', 'error');
      }
    } catch (err) {
      addToast('Connection error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setEditTitle(postData.title);
    setEditContent(postData.content);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditTitle(postData.title);
    setEditContent(postData.content);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      addToast('Title and content cannot be empty', 'error');
      return;
    }
    setSaving(true);

    try {
      const res = await fetch(`${apiBaseUrl}/posts/${postData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setEditing(false);
        addToast('Post updated successfully!', 'success');
        if (onUpdateSuccess) onUpdateSuccess(postData.id, updatedPost);
      } else {
        const errorData = await res.json();
        addToast(errorData.detail || 'Update failed', 'error');
      }
    } catch (err) {
      addToast('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

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
          <div className="post-meta">
            <div className="post-author">
              <User size={14} className="author-icon" />
              <span>{postData.owner?.email || 'Anonymous'}</span>
            </div>
            {postData.created_at && (
              <div className="post-timestamp">
                <Clock size={12} />
                <span>{getRelativeTime(postData.created_at)}</span>
              </div>
            )}
          </div>
          {isOwner && !editing && (
            <div className="post-actions">
              <button onClick={handleEdit} className="btn-edit" title="Edit Post">
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="btn-delete"
                disabled={deleting}
                title="Delete Post"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="edit-mode">
            <input
              type="text"
              className="form-input edit-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post title"
              disabled={saving}
            />
            <textarea
              className="form-input form-textarea edit-content-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Post content"
              disabled={saving}
            />
            <div className="edit-actions">
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                <Check size={16} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="post-title">{postData.title}</h3>
            <p className="post-body">{postData.content}</p>
          </>
        )}
      </div>
    </div>
  );
}
