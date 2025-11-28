import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styled from 'styled-components';

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // --- ANIMATION STATE ---
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef(null);

  // Update the indicator position based on the hovered element
  const handleMouseEnter = (e) => {
    if (!navRef.current) return;
    
    const el = e.currentTarget;
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    setIndicatorStyle({
      left: elRect.left - navRect.left, // Position relative to container
      width: elRect.width,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <StyledNav>
      <div className="navbar-container">
        
        {/* Logo */}
        <Link to="/" className="logo-link">
          <span className="logo-text">FreelanceHub</span>
        </Link>

        {/* Navigation Links Container */}
        {/* We attach the Ref here to calculate positions relative to this box */}
        <div className="nav-links" ref={navRef} onMouseLeave={handleMouseLeave}>
          
          {/* THE SLIDING ANIMATED BORDER */}
          <div 
            className="indicator" 
            style={{ 
              left: `${indicatorStyle.left}px`, 
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity
            }} 
          />

          {/* Search Icon */}
          <Link 
            to="/search" 
            className="nav-item" 
            title="Search Projects"
            onMouseEnter={handleMouseEnter}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <Link to="/projects" className="nav-item" onMouseEnter={handleMouseEnter}>
            Browse Projects
          </Link>

          {isAuthenticated ? (
            <>
              {user && !user.is_freelancer && (
                <Link to="/post-project" className="nav-item" onMouseEnter={handleMouseEnter}>
                  Post Project
                </Link>
              )}
              <Link to={`/profile/${user.id}`} className="nav-item" onMouseEnter={handleMouseEnter}>
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-item logout-btn" onMouseEnter={handleMouseEnter}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item" onMouseEnter={handleMouseEnter}>
                Login
              </Link>
              <Link to="/register" className="nav-item" onMouseEnter={handleMouseEnter}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </StyledNav>
  );
}

// --- STYLES ---
const StyledNav = styled.nav`
  background-color: transparent;
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;

  .navbar-container {
    max-width: 900px;
    width: 90%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 2rem;
    
    /* Dark Glassmorphism Capsule */
    background-color: rgba(26, 26, 46, 0.8); 
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    
    border-radius: 9999px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  .logo-link {
    text-decoration: none;
    font-weight: 800;
    font-size: 1.25rem;
    color: #fff;
    margin-right: 20px;
    z-index: 10; /* Keep logo above slider if it overlaps */
  }

  /* Links Container */
  .nav-links {
    position: relative; /* Needed for absolute positioning of the indicator */
    display: flex;
    align-items: center;
    gap: 5px; /* Gap handled by padding of items mostly */
  }

  /* The Animated Slider */
  .indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    /* This creates the "Border Box" effect from your snippet */
    border: 2px solid #6366f1; /* Indigo/Purple border */
    background-color: rgba(99, 102, 241, 0.1); /* Slight tint inside */
    border-radius: 99px;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 0;
  }

  /* Nav Items (Links & Buttons) */
  .nav-item {
    position: relative;
    z-index: 1; /* Text must be above the indicator */
    color: #a1a1aa;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.6rem 1.2rem;
    border-radius: 99px;
    transition: color 0.3s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-item:hover {
    color: #ffffff; /* White text on hover */
  }

  /* Different style for logout if you want, currently matching others for the animation */
  .logout-btn {
    /* font-size: 0.9rem; */
  }

  @media (max-width: 768px) {
    padding: 1rem;
    .navbar-container {
      flex-direction: column;
      gap: 1rem;
      border-radius: 1.5rem;
      padding: 1.5rem;
    }
    .nav-links {
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
    }
    .indicator {
      display: none; /* Difficult to animate rows correctly on mobile without complex logic */
    }
    .nav-item:hover {
        background-color: rgba(255,255,255,0.1);
    }
  }
`;