import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';

import { AuthProvider } from './context/AuthContext';
import NavBar from './components/Navbar';

import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import ProjectListPage from './components/ProjectListPage';
import ProjectDetailPage from './components/ProjectDetailsPage';
import PostProjectPage from './components/PostProjectPage';
import UserProfilePage from './components/UserProfilePage';
import SearchPage from './components/SearchPage';

import { ProtectedRoute } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <StyledContainer>
        <NavBar />
        <main className="grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/profile/:id" element={<UserProfilePage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/post-project" element={<PostProjectPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <StyledFooter>
          <div className="footer-content">
            <p>&copy; 2025 FreelanceHub. All rights reserved.</p>
            <div className="footer-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </div>
        </StyledFooter>

      </StyledContainer>
    </AuthProvider>
  );
}

// --- STYLES ---

const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #017060db 0%, #024230e2 30%);
  color: #f3f4f6;

  /* --- GLOBAL TEXT FIXES --- */
  
  /* Force dark text inside white cards and inputs */
  .bg-white, .card, input, textarea, select {
    color: #1f2937 !important; /* Dark Gray */
  }

  /* Fix placeholder colors to be visible on white backgrounds */
  ::placeholder {
    color: #9ca3af !important;
  }

  /* Force specific colors for Alerts */
  .text-yellow-700 { color: #a16207 !important; }
  .text-red-500 { color: #ef4444 !important; }
  .text-green-800 { color: #166534 !important; }
`;

const StyledFooter = styled.footer`
  margin-top: auto;
  background: rgba(2, 44, 34, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  padding: 2rem 0;
  text-align: center;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
    font-size: 0.9rem;
  }

  .footer-links span {
    cursor: pointer;
    transition: color 0.2s;
  }

  .footer-links span:hover {
    color: #ffffff;
  }
`;