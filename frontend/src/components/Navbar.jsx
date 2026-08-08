import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PlusCircle, User, LogOut, LogIn, Share2 } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-container glass-panel">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <Share2 className="logo-icon" size={28} />
          <span className="gradient-text font-heading logo-text">VibeShare</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <Home size={18} />
            <span>Feed</span>
          </Link>

          {user ? (
            <>
              <Link to="/create-post" className="nav-link nav-link-highlight">
                <PlusCircle size={18} />
                <span>New Post</span>
              </Link>
              <Link to="/profile" className="nav-link">
                <User size={18} />
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout nav-link">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary login-btn">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
