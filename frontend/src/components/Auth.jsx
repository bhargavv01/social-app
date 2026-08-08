import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, UserPlus, LogIn, Loader2 } from 'lucide-react';
import './Auth.css';

export default function Auth() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Simple email checks
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await register(email, password);
        setSuccess('Registration successful! You can now log in.');
        setActiveTab('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-container container flex-center fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-tabs">
          <button
            onClick={() => handleTabChange('login')}
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            disabled={loading}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
        </div>

        <div className="auth-header">
          <h2>{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {activeTab === 'login'
              ? 'Enter your credentials to access your account.'
              : 'Sign up to start sharing posts and voting.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="form-error-alert">{error}</div>}
          {success && <div className="form-success-alert">{success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email-input"
                type="email"
                className="form-input text-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <div className="input-with-icon">
              <KeyRound className="input-icon" size={18} />
              <input
                id="password-input"
                type="password"
                className="form-input text-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password-input">
                Confirm Password
              </label>
              <div className="input-with-icon">
                <KeyRound className="input-icon" size={18} />
                <input
                  id="confirm-password-input"
                  type="password"
                  className="form-input text-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                <span>Processing...</span>
              </>
            ) : activeTab === 'login' ? (
              <span>Login</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
