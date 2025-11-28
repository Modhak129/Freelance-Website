import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from './ProjectCard';
import { useNavigate } from 'react-router-dom';

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/projects');
        
        // --- SAFETY CHECK (The Fix) ---
        // Only set projects if the response is actually an array (List).
        if (Array.isArray(res.data)) {
            setProjects(res.data);
        } else {
            console.error("API Error: Expected array but got:", res.data);
            setProjects([]); // Fallback to empty list to prevent crash
            // If the backend sent an error message object, show it
            if (res.data.error) setError(res.data.error);
        }
        // -----------------------------

      } catch (err) {
        console.error('Failed to fetch projects', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // --- HANDLE SEARCH REDIRECT ---
  const handleSearchFocus = (e) => {
    // Option 1: Redirect immediately on focus
    // navigate('/search'); 
  };

  const handleSearchChange = (e) => {
    // Option 2: Redirect as soon as user types
    const query = e.target.value;
    if (query) {
        navigate('/search', { state: { initialQuery: query } });
    }
  };

  // Pagination Logic
  // Now safe because 'projects' is guaranteed to be an array
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-400">{error}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-sm">
        Open Projects
      </h1>

      {/* --- SEARCH BAR (Redirects to Search Page) --- */}
      <div className="flex justify-center mb-12">
        <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent sm:text-sm shadow-lg transition-all"
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
        </div>
      </div>

      {/* --- PROJECT GRID --- */}
      <div className="flex flex-wrap justify-center gap-8">
        {currentProjects.length === 0 ? (
          <p className="text-gray-300 text-lg">No projects available at the moment.</p>
        ) : (
          currentProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {projects.length > projectsPerPage && (
        <div className="flex justify-center mt-12 gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded font-medium transition-colors ${
                currentPage === 1 
                ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-green-800 hover:bg-gray-100'
            }`}
          >
            Prev
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
             <button
               key={index}
               onClick={() => paginate(index + 1)}
               className={`px-4 py-2 rounded font-medium transition-colors ${
                 currentPage === index + 1 
                   ? 'bg-green-600 text-white shadow-md' 
                   : 'bg-white text-gray-700 hover:bg-gray-100'
               }`}
             >
               {index + 1}
             </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded font-medium transition-colors ${
                currentPage === totalPages 
                ? 'bg-white/10 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-green-800 hover:bg-gray-100'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}