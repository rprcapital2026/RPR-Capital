import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, LayoutDashboard, UserPlus, Menu, X } from 'lucide-react';

export function Navbar({ onNavigate, currentView, setCurrentView }) {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(view);
    } else if (setCurrentView) {
      setCurrentView(view);
    }
  };

  const handleScrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      handleNav('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isPortal = currentView === 'portal' || currentView === 'admin-portal';

  return (
    <header className="header-nav">
      <div className="container nav-container" style={isPortal ? { maxWidth: '100%' } : {}}>
        {/* Brand Logo & Name */}
        <div className="brand-logo-wrap" onClick={() => handleNav(isPortal ? 'portal' : 'home')} style={{ cursor: 'pointer' }}>
          <img src="/logo-icon.png" alt="RPR Capital Logo" className="brand-logo-img" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <div className="brand-title">
            <span className="brand-main-text" style={{ fontSize: '1.24rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.35rem', lineHeight: 1.15 }}>
              <span>
                <span style={{ color: '#0486db', fontWeight: 900 }}>R</span>
                <span style={{ color: '#a122d6', fontWeight: 900 }}>P</span>
                <span style={{ color: '#0486db', fontWeight: 900 }}>R</span>
              </span>
              <span style={{ color: '#0f172a' }}>CAPITAL</span>
            </span>
            <span className="brand-sub-text">Rajasthan Pay Reserve</span>
          </div>
        </div>

        {/* Public Marketing Links - ONLY shown on public website desktop */}
        {!isPortal && (
          <ul className="nav-links">
            <li
              className={`nav-link-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => {
                handleNav('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </li>
            <li
              className="nav-link-item"
              onClick={() => handleScrollToSection('services-section')}
            >
              Services
            </li>
            <li
              className="nav-link-item"
              onClick={() => handleScrollToSection('calculator-section')}
            >
              EMI Calculator
            </li>
            <li
              className="nav-link-item"
              onClick={() => handleScrollToSection('about-section')}
            >
              About Us
            </li>
          </ul>
        )}

        {/* Right Action Buttons */}
        <div className="nav-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {currentView === 'home' && (
                <button
                  className="btn btn-primary btn-sm btn-nav-dash-desktop"
                  onClick={() => handleNav('portal')}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
              )}

              <button
                id="btn-navbar-exit"
                className="btn btn-exit-danger btn-sm"
                onClick={() => {
                  logout();
                  handleNav('home');
                }}
                title="Sign out of RPR Capital"
              >
                <LogOut size={13} /> Exit
              </button>
            </div>
          ) : (
            <div className="nav-guest-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleNav('login')}
              >
                <LogIn size={14} /> Sign In
              </button>

              <button
                className="btn btn-secondary btn-sm nav-reg-btn-desktop"
                onClick={() => handleNav('register')}
                style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger (Visible only on < 768px when on public website) */}
          {!isPortal && (
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Drawer for Public Views */}
      {mobileMenuOpen && !isPortal && (
        <div className="mobile-nav-drawer">
          <div
            className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => {
              handleNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </div>
          <div
            className="mobile-nav-item"
            onClick={() => handleScrollToSection('services-section')}
          >
            Services
          </div>
          <div
            className="mobile-nav-item"
            onClick={() => handleScrollToSection('calculator-section')}
          >
            EMI Calculator
          </div>
          <div
            className="mobile-nav-item"
            onClick={() => handleScrollToSection('about-section')}
          >
            About Us
          </div>

          <div className="mobile-nav-auth-buttons">
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleNav('portal')}
                >
                  <LayoutDashboard size={14} /> Open Portal Dashboard
                </button>
                <button
                  className="btn btn-exit-danger btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    logout();
                    handleNav('home');
                  }}
                >
                  <LogOut size={13} /> Exit Portal
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', width: '100%' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleNav('login')}
                  style={{ width: '100%' }}
                >
                  <LogIn size={14} /> Sign In
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleNav('register')}
                  style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
                >
                  <UserPlus size={14} /> Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
export default Navbar;
