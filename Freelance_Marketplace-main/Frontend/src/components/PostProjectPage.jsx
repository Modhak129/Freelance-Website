import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Same skills list as your profile page
const AVAILABLE_SKILLS = [
  "Web Development", "App Development", "UI/UX Design", "Python", "Java",
  "React.js", "Node.js", "Data Analysis", "Content Writing", "Digital Marketing",
  "SEO", "Graphic Design"
];

export default function PostProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: ''
  });
  
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillToggle = (skill) => {
    setRequiredSkills(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill);
      else return [...prev, skill];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- CUSTOM VALIDATION: Check if at least one skill is selected ---
    if (requiredSkills.length === 0) {
      setError('Please select at least one Required Skill.');
      // Scroll to top to show error
      window.scrollTo(0, 0); 
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget),
        required_skills: requiredSkills.join(',') 
      };

      await axios.post('/projects', payload);
      navigate('/projects');
    } catch (err) {
      console.error('Error posting project:', err);
      setError('Failed to post project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed local background gradient so the global Green Theme shows through
    <div className="min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-md">Post a New Project</h1>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Input */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Project Title <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              name="title"
              required  // <--- HTML5 Validation
              placeholder="e.g. E-commerce Website Redesign"
              className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-colors text-gray-900 placeholder-gray-500"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Description <span className="text-red-300">*</span>
            </label>
            <textarea
              name="description"
              required // <--- HTML5 Validation
              rows="5"
              placeholder="Describe the project details, deliverables, and timeline..."
              className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-colors text-gray-900 placeholder-gray-500"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Required Skills <span className="text-red-300">*</span>
            </label>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 bg-white/40 p-4 rounded-lg border ${requiredSkills.length === 0 && error ? 'border-red-400 ring-2 ring-red-400' : 'border-white/20'}`}>
              {AVAILABLE_SKILLS.map((skill) => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-white/30 p-1 rounded transition">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-indigo-900 rounded border-gray-300 focus:ring-indigo-500"
                    checked={requiredSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <span className="text-gray-900 font-medium text-sm">{skill}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-200 mt-1 font-medium">Select the skills freelancers need for this job.</p>
          </div>

          {/* Budget Input */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Budget ($) <span className="text-red-300">*</span>
            </label>
            <input
              type="number"
              name="budget"
              required // <--- HTML5 Validation
              min="1"
              step="0.01"
              placeholder="500.00"
              className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-colors text-gray-900 placeholder-gray-500"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Timeline (Days) <span className="text-red-300">*</span>
            </label>
            <input
              type="number"
              name="deadline_days"
              required
              min="2" // <--- Enforces minimum 2 in the browser
              placeholder="e.g. 7 (Minimum: 2)"
              className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-colors text-gray-900 placeholder-gray-500"
              value={formData.deadline_days}
              onChange={(e) => {
                // Optional: Prevent user from even typing numbers < 1, 
                // but allow empty string for typing experience
                const val = e.target.value;
                setFormData({ ...formData, deadline_days: val });
              }}
              // Optional: On Blur check to auto-correct
              onBlur={(e) => {
                 if(e.target.value !== "" && parseInt(e.target.value) < 2) {
                    setFormData({ ...formData, deadline_days: "2" });
                 }
              }}
            />
            <p className="text-xs text-gray-200 mt-1">Minimum 2 days required for project completion.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-linear-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800'
            }`}
          >
            {loading ? 'Posting...' : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
}