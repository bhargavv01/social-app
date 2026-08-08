import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenTool, Check, Loader2, ArrowLeft } from 'lucide-react';
import './CreatePost.css';

export default function CreatePost() {
  const { user, token, apiBaseUrl } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Protected route enforcement
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be blank.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          published,
        }),
      });

      if (res.ok) {
        navigate('/');
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please verify your backend server is running.');
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
          {error && <div className="form-error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
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
            <label htmlFor="content" className="form-label">
              Content
            </label>
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
