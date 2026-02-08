import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'NGO') return '/ngo';
    return '/user';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Aashrey For Paws 🐾
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={toggleMenu}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/pet-find" className="nav-links" onClick={toggleMenu}>
              Adopt
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/lost-found" className="nav-links" onClick={toggleMenu}>
              Lost & Found
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/community" className="nav-links" onClick={toggleMenu}>
              Community
            </Link>
          </li>
          { }
          {(!user || ['Adopter', 'Owner'].includes(user.role)) && (
            <li className="nav-item">
              <Link to="/donate" className="nav-links" onClick={toggleMenu}>
                Donate
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link to="/contact" className="nav-links" onClick={toggleMenu}>
              Contact
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to={getDashboardLink()} className="nav-links" onClick={toggleMenu}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item" onClick={handleLogout}>
                <span className="nav-links-mobile-logout">Logout</span>
              </li>
              <Link to="/notifications" className="nav-links notification-icon">
                <FaBell size={20} />
                { }
              </Link>
              <li className="nav-item-profile">
                <span className="profile-icon" title={`Logged in as ${user?.name}`}>
                  <FaUserCircle size={24} />
                </span>
                <button onClick={handleLogout} className="btn-logout-desktop">Logout</button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-links-mobile">
                Login
              </Link>
            </li>
          )}
        </ul>
        {!isAuthenticated && <Link to="/login" className="btn-login-desktop">Login</Link>}
      </div>
      <style>{`
                /* Basic Navbar Styles if Navbar.css is missing/incomplete */
                .navbar {
                    background: #5d4037; /* Brown theme */
                    height: 80px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.2rem;
                    position: sticky;
                    top: 0;
                    z-index: 999;
                }
                .navbar-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 80px;
                    max-width: 1500px;
                    width: 100%;
                    padding: 0 20px;
                }
                .navbar-logo {
                    color: #fff;
                    font-weight: bold;
                    text-decoration: none;
                    font-size: 1.5rem;
                }
                .nav-menu {
                    display: flex;
                    list-style: none;
                    text-align: center;
                    margin: 0;
                    padding: 0;
                    gap: 20px;
                }
                .nav-links {
                    color: #fff;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                }
                .nav-links:hover {
                    border-bottom: 2px solid #fff;
                }
                .btn-login-desktop, .btn-logout-desktop {
                    padding: 8px 20px;
                    border-radius: 4px;
                    outline: none;
                    border: none;
                    font-size: 18px;
                    color: #5d4037;
                    background-color: #fff;
                    font-weight: bold;
                    cursor: pointer;
                    text-decoration: none;
                    margin-left: 20px;
                }
                .btn-login-desktop:hover, .btn-logout-desktop:hover {
                    background-color: #f1f1f1;
                    transition: all 0.3s ease-out;
                }
                .menu-icon {
                    display: none;
                }
                .nav-item-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                }
                 .nav-links-mobile-logout {
                    color: #fff;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    display: none; /* Hidden on desktop */
                }
                .nav-links-mobile {
                    display: none;
                }


                @media screen and (max-width: 960px) {
                    .menu-icon {
                        display: block;
                        color: #fff;
                        font-size: 1.8rem;
                        cursor: pointer;
                    }
                    .nav-menu {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        height: 90vh;
                        position: absolute;
                        top: 80px;
                        left: -100%;
                        opacity: 1;
                        transition: all 0.5s ease;
                        background: #5d4037;
                    }
                    .nav-menu.active {
                        left: 0;
                        opacity: 1;
                        transition: all 0.5s ease;
                        z-index: 1;
                    }
                    .nav-item-profile, .btn-login-desktop {
                        display: none;
                    }
                    .nav-links-mobile {
                        display: block;
                        text-align: center;
                        padding: 1.5rem;
                        width: 100%;
                        display: table;
                        color: #fff;
                        text-decoration: none;
                    }
                    .nav-links-mobile-logout {
                        display: block;
                    }
                }
            `}</style>
    </nav>
  );
};

export default Navbar;
