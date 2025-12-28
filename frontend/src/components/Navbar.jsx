import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate('/login');
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">🐾Aashrey For Paws </Link>

        <div className="mobile-menu-btn" onClick={toggleMenu}>
          ☰
        </div>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/pet-find" className="nav-link" onClick={() => setIsMenuOpen(false)}>Adopt</Link>
          <Link to="/lost-found" className="nav-link" onClick={() => setIsMenuOpen(false)}>Lost & Found</Link>
          <Link to="/community" className="nav-link" onClick={() => setIsMenuOpen(false)}>Community</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>

          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="btn btn-outline btn-sm">Logout</button>
          ) : (
            <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
          )}
        </div>
      </div>
      <style>{`
                .navbar {
                    background-color: var(--color-surface);
                    box-shadow: var(--shadow-sm);
                    padding: 1rem 0;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo {
                    font-family: var(--font-family-heading);
                    font-weight: 700;
                    font-size: 1.5rem;
                    color: var(--color-primary);
                }
                .nav-links {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }
                .nav-link {
                    color: var(--color-text);
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .nav-link:hover {
                    color: var(--color-primary);
                }
                .btn-sm {
                   padding: 0.5rem 1rem;
                   font-size: 0.9rem;
                }
                .mobile-menu-btn {
                    display: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--color-primary);
                }

                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }
                    .nav-links {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: var(--color-surface);
                        flex-direction: column;
                        padding: 1rem;
                        box-shadow: var(--shadow-md);
                    }
                    .nav-links.active {
                        display: flex;
                    }
                }
            `}</style>
    </nav>
  );
}

export default Navbar;
