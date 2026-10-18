import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { Calculator } from './components/Calculator';
import { AboutOwnerSection } from './components/AboutOwnerSection';
import { Footer } from './components/Footer';

// Standalone Pages & Dashboards
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  const { currentUser, role } = useAuth();

  // Helper to determine view from current URL pathname
  const getViewFromPath = () => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase();
    if (path === '/' || path === '') return 'home';
    if (path === '/rprcapital' || path === '/admin') return 'admin-portal';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/portal') return 'portal';
    return 'not-found';
  };

  const [currentView, setCurrentView] = useState(getViewFromPath);

  // Synchronize browser history and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation controller with history pushState
  const navigateTo = (view, targetPath) => {
    let path = '/';
    if (view === 'admin-portal' || view === 'admin') path = '/rprcapital';
    else if (view === 'login') path = '/login';
    else if (view === 'register') path = '/register';
    else if (view === 'portal') path = '/portal';
    else if (targetPath) path = targetPath;

    try {
      window.history.pushState({ view }, '', path);
    } catch {
      // Fallback if pushState restricted in certain environments
    }

    setCurrentView(view === 'admin' ? 'admin-portal' : view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    navigateTo('portal');
  };

  return (
    <div className="app-root">
      {/* Universal Top Navigation */}
      <Navbar
        onNavigate={navigateTo}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* 1. Direct Admin Portal Route (/admin) */}
      {currentView === 'admin-portal' && (
        <main>
          {currentUser && role === 'admin' ? (
            <AdminDashboard onNavigate={navigateTo} />
          ) : (
            <LoginPage
              onNavigate={navigateTo}
              onLoginSuccess={handleLoginSuccess}
              initialRole="admin"
              isAdminDirect={true}
            />
          )}
        </main>
      )}

      {/* 2. Standalone Login Page (/login) */}
      {currentView === 'login' && (
        <main>
          <LoginPage
            onNavigate={navigateTo}
            onLoginSuccess={handleLoginSuccess}
            initialRole="customer"
            isAdminDirect={false}
          />
        </main>
      )}

      {/* 3. Standalone Register Page (/register) */}
      {currentView === 'register' && (
        <main>
          <RegisterPage onNavigate={navigateTo} />
        </main>
      )}

      {/* 4. Authenticated Role Dashboards (/portal) */}
      {currentView === 'portal' && (
        <main>
          {currentUser ? (
            <>
              {role === 'customer' && <CustomerDashboard onNavigate={navigateTo} />}
              {role === 'staff' && <StaffDashboard onNavigate={navigateTo} />}
              {role === 'admin' && <AdminDashboard onNavigate={navigateTo} />}
              {!['customer', 'staff', 'admin'].includes(role) && (
                <CustomerDashboard onNavigate={navigateTo} />
              )}
            </>
          ) : (
            <LoginPage
              onNavigate={navigateTo}
              onLoginSuccess={handleLoginSuccess}
              initialRole="customer"
            />
          )}
        </main>
      )}

      {/* 5. Authentic Public Homepage (/) */}
      {currentView === 'home' && (
        <main>
          <HeroSection
            onNavigate={navigateTo}
            onScrollToCalc={() => {
              document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <ServicesSection onNavigate={navigateTo} />

          <Calculator />

          <AboutOwnerSection />
        </main>
      )}

      {/* 6. Dedicated 404 Not Found Page */}
      {currentView === 'not-found' && (
        <main style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-cyan-glow)', lineHeight: 1, marginBottom: '0.75rem' }}>404</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              The requested address does not exist or may have been relocated within Rajasthan Pay Reserve.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigateTo('home')}>
                Return to Homepage
              </button>
              <button className="btn btn-secondary" onClick={() => navigateTo('login')}>
                Customer Sign In
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer: Rendered on public pages (inside portal, minimal footer is in the scrollable pane) */}
      {currentView !== 'portal' && currentView !== 'admin-portal' && (
        <Footer onNavigate={navigateTo} />
      )}
    </div>
  );
}

export default App;
