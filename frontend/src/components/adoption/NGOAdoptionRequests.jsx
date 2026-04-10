import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars, FaTimes, FaUserCircle, FaBell, FaChevronDown,
  FaSignOutAlt, FaTachometerAlt, FaPaw, FaHome, FaSearch,
  FaClipboardList, FaUsers, FaHandHoldingHeart, FaBullhorn, FaEnvelope, FaMapMarkerAlt
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import api from "../services/axios";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // ── Pages where the navbar is hidden entirely ──
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith("/admin");
  const isNGOPage = location.pathname.startsWith("/ngo");
  const isUserDashboard = location.pathname.startsWith("/user");

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Fetch unread notification status
  useEffect(() => {
    if (isAuthenticated && !showNotifications) {
      api.get('/notifications')
        .then(res => {
          if (res.data.success) setHasUnread(res.data.data.some(n => !n.read));
        })
        .catch(err => console.error("Nav notifs error", err));
    }
  }, [isAuthenticated, showNotifications]);

  if (isAuthPage || isAdminPage || isNGOPage || isUserDashboard) return null;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "Admin") return "/admin";
    if (user.role === "NGO") return "/ngo";
    if (user.role === "Owner") return "/user";
    return "/user";
  };

  const getAvatarLetter = () => (user?.name ? user.name.charAt(0).toUpperCase() : "U");

  // ── Nav links — role-aware ──
  const baseLinks = [
    { to: "/", label: "Home", icon: <FaHome />, exact: true },
    { to: "/about", label: "About", icon: <FaPaw /> },
    { to: "/pet-find", label: "Adopt", icon: <FaSearch /> },
    { to: "/lost-found", label: "Lost & Found", icon: <FaClipboardList /> },
    { to: "/shelter-map", label: "Shelter Map", icon: <FaMapMarkerAlt /> },
    { to: "/community", label: "Community", icon: <FaUsers /> },
    { to: "/contact", label: "Contact", icon: <FaEnvelope /> },
  ];

  let extraLinks = [];
  // Show Campaigns & Donate for Guests, Adopters, Owners, and Admins
  if (!user || ["Adopter", "Owner", "Admin"].includes(user.role)) {
    extraLinks = [
      { to: "/donate", label: "Donate", icon: <FaHandHoldingHeart /> },
      { to: "/campaigns", label: "Campaigns", icon: <FaBullhorn /> },
    ];
  } else if (user && user.role === "NGO") {
    // Show only Donate for NGOs
    extraLinks = [
      { to: "/donate", label: "Donate", icon: <FaHandHoldingHeart /> },
    ];
  }

  // Insert extra links before Contact
  const navLinks = [
    ...baseLinks.slice(0, -1),
    ...extraLinks,
    baseLinks[baseLinks.length - 1],
  ];

  return (
    <>
      {isOpen && <div className="nav-backdrop" onClick={() => setIsOpen(false)} />}

      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar-container">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo__paw">🐾</span>
            <span className="navbar-logo__text">Aashrey For Paws</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="nav-menu">
            {navLinks.map(({ to, label, exact }) => (
              <li key={to} className="nav-item">
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) => "nav-links" + (isActive ? " nav-links--active" : "")}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="notif-wrapper" ref={notifRef}>
                  <button
                    className="icon-btn"
                    onClick={() => setShowNotifications(s => !s)}
                    aria-label="Notifications"
                  >
                    <FaBell size={17} />
                    {hasUnread && <span className="notif-dot" />}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* User Menu */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                    className="user-menu-trigger"
                    onClick={() => setShowUserMenu(s => !s)}
                    aria-label="User menu"
                  >
                    <div className="user-avatar-circle">{getAvatarLetter()}</div>
                    <span className="user-menu-name">{user?.name?.split(" ")[0]}</span>
                    <FaChevronDown size={10} className={`chevron ${showUserMenu ? "chevron--up" : ""}`} />
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown">
                      {/* Profile header */}
                      <div className="user-dropdown__header">
                        <div className="user-dropdown__avatar">{getAvatarLetter()}</div>
                        <div>
                          <p className="user-dropdown__name">{user?.name}</p>
                          <p className="user-dropdown__role">{user?.role}</p>
                        </div>
                      </div>
                      <div className="user-dropdown__divider" />

                      <Link to={`${getDashboardLink()}?tab=profile`} className="user-dropdown__item" onClick={() => setShowUserMenu(false)}>
                        <FaUserCircle size={14} /> My Profile
                      </Link>

                      <div className="user-dropdown__divider" />
                      <button className="user-dropdown__item user-dropdown__item--danger" onClick={handleLogout}>
                        <FaSignOutAlt size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Log In</Link>
                <Link to="/signup" className="btn-signup">Sign Up</Link>
              </div>
            )}

            {/* Hamburger */}
            <button className="menu-icon" onClick={() => setIsOpen(s => !s)} aria-label="Toggle menu">
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div className={`mobile-drawer ${isOpen ? "mobile-drawer--open" : ""}`}>
          {/* Mobile user section */}
          {isAuthenticated && (
            <div className="mobile-user-header">
              <div className="mobile-user-avatar">{getAvatarLetter()}</div>
              <div>
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-role">{user?.role}</div>
              </div>
            </div>
          )}

          <ul className="mobile-nav-menu">
            {navLinks.map(({ to, label, icon, exact }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) => "mobile-nav-link" + (isActive ? " mobile-nav-link--active" : "")}
                >
                  <span className="mobile-nav-icon">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}

            <div className="mobile-drawer__divider" />

            {isAuthenticated ? (
              <>
                <li>
                  <NavLink to={`${getDashboardLink()}?tab=profile`} className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                    <span className="mobile-nav-icon"><FaUserCircle /></span> My Profile
                  </NavLink>
                </li>
                <li>
                  <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}>
                    <span className="mobile-nav-icon"><FaSignOutAlt /></span> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className="mobile-nav-link">
                    <span className="mobile-nav-icon"><FaUserCircle /></span> Log In
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className="mobile-nav-link">
                    <span className="mobile-nav-icon"><FaPaw /></span> Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
