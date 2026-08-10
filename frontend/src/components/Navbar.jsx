import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PlusCircle, User, LogOut, LogIn, Share2, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar-container glass-panel">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <Share2 className="logo-icon" size={28} />
          <span className="gradient-text font-heading logo-text">VibeShare</span>
        </Link>

        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMenu} />}

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            <Home size={18} />
            <span>Feed</span>
          </Link>

          {user ? (
            <>
              <Link to="/create-post" className="nav-link nav-link-highlight" onClick={closeMenu}>
                <PlusCircle size={18} />
                <span>New Post</span>
              </Link>
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                <User size={18} />
                <span>Profile</span>
              </Link>
              <button onClick={() => { closeMenu(); handleLogout(); }} className="btn-logout nav-link">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary login-btn" onClick={closeMenu}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
