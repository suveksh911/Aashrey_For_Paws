import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaBell, FaChevronDown, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "Admin") return "/admin";
    if (user.role === "NGO") return "/ngo";
    return "/user";
  };

  const navLinks = [
    { to: "/", label: "Home", exact: true },
    { to: "/about", label: "About" },
    { to: "/pet-find", label: "Adopt" },
    { to: "/lost-found", label: "Lost & Found" },
    { to: "/adoption-board", label: "Adopt Board" },
    { to: "/community", label: "Community" },
    ...(!user || ["Adopter", "Owner"].includes(user.role)
      ? [
        { to: "/donate", label: "Donate" },
        { to: "/campaigns", label: "Campaigns" },
      ]
      : []),
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div className="nav-backdrop" onClick={() => setIsOpen(false)} />
      )}

      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo__paw">🐾</span>
            <span className="navbar-logo__text">Aashrey For Paws</span>
          </Link>

          {/* Desktop nav links */}
          {!isAuthPage && (
            <ul className="nav-menu">
              {navLinks.map(({ to, label, exact }) => (
                <li key={to} className="nav-item">
                  <NavLink
                    to={to}
                    end={exact}
                    className={({ isActive }) =>
                      "nav-links" + (isActive ? " nav-links--active" : "")
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}

          {/* Right-side actions */}
          {!isAuthPage && (
            <div className="navbar-actions">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <div className="notif-wrapper" ref={notifRef}>
                    <button
                      className="icon-btn"
                      onClick={() => setShowNotifications((s) => !s)}
                      aria-label="Notifications"
                    >
                      <FaBell size={18} />
                    </button>
                    {showNotifications && (
                      <NotificationDropdown
                        onClose={() => setShowNotifications(false)}
                      />
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="user-menu-wrapper" ref={userMenuRef}>
                    <button
                      className="user-menu-trigger"
                      onClick={() => setShowUserMenu((s) => !s)}
                    >
                      <FaUserCircle size={22} />
                      <span className="user-menu-name">{user?.name?.split(" ")[0]}</span>
                      <FaChevronDown
                        size={11}
                        className={`chevron ${showUserMenu ? "chevron--up" : ""}`}
                      />
                    </button>

                    {showUserMenu && (
                      <div className="user-dropdown">
                        <div className="user-dropdown__header">
                          <p className="user-dropdown__name">{user?.name}</p>
                          <p className="user-dropdown__role">{user?.role}</p>
                        </div>
                        <div className="user-dropdown__divider" />
                        <Link
                          to={getDashboardLink()}
                          className="user-dropdown__item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaTachometerAlt size={13} /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="user-dropdown__item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUserCircle size={13} /> Profile
                        </Link>
                        <div className="user-dropdown__divider" />
                        <button
                          className="user-dropdown__item user-dropdown__item--danger"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt size={13} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login" className="btn-login">
                  Login
                </Link>
              )}

              {/* Hamburger – mobile only */}
              <button
                className="menu-icon"
                onClick={() => setIsOpen((s) => !s)}
                aria-label="Toggle menu"
              >
                {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Drawer */}
        {!isAuthPage && (
          <div className={`mobile-drawer ${isOpen ? "mobile-drawer--open" : ""}`}>
            <ul className="mobile-nav-menu">
              {navLinks.map(({ to, label, exact }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={exact}
                    className={({ isActive }) =>
                      "mobile-nav-link" + (isActive ? " mobile-nav-link--active" : "")
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              <div className="mobile-drawer__divider" />
              {isAuthenticated ? (
                <>
                  <li>
                    <NavLink to={getDashboardLink()} className="mobile-nav-link">
                      <FaTachometerAlt size={13} /> Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile" className="mobile-nav-link">
                      <FaUserCircle size={13} /> Profile
                    </NavLink>
                  </li>
                  <li>
                    <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt size={13} /> Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <NavLink to="/login" className="mobile-nav-link">
                    Login
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
