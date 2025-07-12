import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import classes from './Header.module.scss';
import logo from '@/assets/images/sounglah-logo.svg';

export const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <Link to="/" className={classes.logo}>
          <img src={logo} className={classes.image} alt="sounglah" />
          Sounglah
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className={classes.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={`${classes.hamburger} ${isMenuOpen ? classes.active : ''}`}></span>
        </button>
        
        {/* Desktop navigation */}
        <nav className={`${classes.nav} ${classes.desktopNav}`}>
          <Link 
            to="/" 
            className={`${classes.navLink} ${location.pathname === '/' ? classes.active : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/translate" 
            className={`${classes.navLink} ${location.pathname === '/translate' ? classes.active : ''}`}
          >
            Translate
          </Link>
          {isAuthenticated && (
            <Link 
              to="/admin" 
              className={`${classes.navLink} ${location.pathname === '/admin' ? classes.active : ''}`}
            >
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <div className={classes.userSection}>
              <span className={classes.username}>Welcome, {user?.username}</span>
              <button onClick={logout} className={classes.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className={`${classes.navLink} ${location.pathname === '/login' ? classes.active : ''}`}
            >
              Login
            </Link>
          )}
        </nav>
        
        {/* Mobile navigation */}
        <nav className={`${classes.nav} ${classes.mobileNav} ${isMenuOpen ? classes.open : ''}`}>
          <Link 
            to="/" 
            className={`${classes.navLink} ${location.pathname === '/' ? classes.active : ''}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            to="/translate" 
            className={`${classes.navLink} ${location.pathname === '/translate' ? classes.active : ''}`}
            onClick={closeMenu}
          >
            Translate
          </Link>
          {isAuthenticated && (
            <Link 
              to="/admin" 
              className={`${classes.navLink} ${location.pathname === '/admin' ? classes.active : ''}`}
              onClick={closeMenu}
            >
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <div className={classes.mobileUserSection}>
                <span className={classes.username}>Welcome, {user?.username}</span>
                <button onClick={() => { logout(); closeMenu(); }} className={classes.logoutButton}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`${classes.navLink} ${location.pathname === '/login' ? classes.active : ''}`}
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
      {/* Mobile navigation backdrop */}
      <div 
          className={`${classes.backdrop} ${isMenuOpen ? classes.open : ''}`}
          onClick={closeMenu}
        ></div>
    </header>
  );
};