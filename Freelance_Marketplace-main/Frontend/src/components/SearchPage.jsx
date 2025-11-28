import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from './ProjectCard';
import { useLocation } from 'react-router-dom';

export default function SearchPage() {
  // Data States
  const [projects, setProjects] = useState([]); // All loaded projects
  const [filteredProjects, setFilteredProjects] = useState([]); // Matched results
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;

  const location = useLocation();

  // 1. Initial Fetch
  useEffect(() => {
    if (location.state && location.state.initialQuery) {
      setSearchTerm(location.state.initialQuery);
    }

    const fetchProjects = async () => {
      try {
        const res = await axios.get('/projects');
        setProjects(res.data);
        // We do NOT set filteredProjects here initially, 
        // because we want "No results" if search is empty.
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [location.state]);

  // 2. Search & Filter Logic
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();

    // Requirement: Ensure no results appear when nothing is searched
    if (!term) {
      setFilteredProjects([]);
      return;
    }

    const results = projects.filter(project => {
      return (
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        (project.required_skills && project.required_skills.toLowerCase().includes(term))
      );
    });

    setFilteredProjects(results);
    setCurrentPage(1); // Reset to page 1 on new search
  }, [searchTerm, projects]);

  // 3. Pagination Logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* --- Header / Search Section --- */}
      <div className="bg-black/20 backdrop-blur-sm py-12 px-4 shadow-sm border-b border-white/5">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-6 drop-shadow-md">Find Your Next Project</h1>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-full shadow-xl text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-400 text-lg transition-all"
              placeholder="Search by title, skill, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* --- Results Section --- */}
      <div className="container mx-auto py-12 px-4">
        {loading ? (
          <div className="text-center text-white mt-10">Loading projects...</div>
        ) : (
          <>
            {/* Result Count */}
            {searchTerm && (
              <p className="mb-6 text-gray-200 font-medium pl-4">
                Found {filteredProjects.length} result{filteredProjects.length !== 1 && 's'} for "{searchTerm}"
              </p>
            )}
            
            {/* Grid */}
            <div className="flex flex-wrap justify-center gap-8">
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="text-center py-20 w-full">
                  {searchTerm ? (
                    <p className="text-xl text-gray-300">No projects match your search.</p>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg">Type something above to start searching</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            {filteredProjects.length > projectsPerPage && (
              <div className="flex justify-center mt-16 gap-2">
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
          </>
        )}
      </div>
    </div>
  );
}