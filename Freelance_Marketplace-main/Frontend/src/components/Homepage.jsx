import React from 'react';
import { Link } from 'react-router-dom';
// 1. Import the Auth Context
import { useAuth } from '../context/AuthContext.jsx';
import {AnimatedButton} from '../styles/AnimatedButton';

export default function HomePage() {
  // 2. Get the current user from context
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-16 text-center px-4">
      <h1 className="text-5xl font-extrabold mb-4">Find Your Next Big Opportunity</h1>
      <p className="text-xl mb-8">
        The platform that connects talented freelancers with innovative clients.
      </p>
      <div className="space-x-4">
        <AnimatedButton><Link to="/projects" >
          Browse Projects
        </Link></AnimatedButton>

        {/* 3. CONDITIONAL RENDERING: 
            Only show if user exists (logged in) AND is NOT a freelancer. 
        */}
        {user && !user.is_freelancer && (
          <AnimatedButton><Link to="/post-project">
            Post a Job
          </Link></AnimatedButton>
        )}
      </div>
    </div>
  );
}