import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PenTool, Check, Loader2, ArrowLeft } from 'lucide-react';
import './CreatePost.css';

const TITLE_MAX = 200;
const CONTENT_MAX = 5000;

export default function CreatePost() {
  const { user, token, apiBaseUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Title and content cannot be blank.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, published }),
      });

      if (res.ok) {
        addToast('Post published successfully!', 'success');
        navigate('/');
      } else {
        const errorData = await res.json();
        addToast(errorData.detail || 'Failed to create post', 'error');
      }
    } catch (err) {
      addToast('Connection failed. Is the backend running?', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="create-post-container container fade-in">
      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="create-post-card glass-panel">
        <header className="card-header">
          <PenTool className="header-icon" size={24} />
          <h2>Share a New Post</h2>
          <p>Let the community know what's on your mind.</p>
        </header>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="title" className="form-label">Title</label>
              <span className={`char-count ${title.length > TITLE_MAX ? 'over-limit' : ''}`}>
                {title.length} / {TITLE_MAX}
              </span>
            </div>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Give your post an engaging title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="content" className="form-label">Content</label>
              <span className={`char-count ${content.length > CONTENT_MAX ? 'over-limit' : ''}`}>
                {content.length} / {CONTENT_MAX}
              </span>
            </div>
            <textarea
              id="content"
              className="form-input form-textarea"
              placeholder="What do you want to share with everyone?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group-toggle">
            <label className="toggle-label" htmlFor="published">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                disabled={submitting}
                className="toggle-checkbox"
              />
              <span className="toggle-custom-box"></span>
              <span className="toggle-text-label">Publish immediately</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Publish Post</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
