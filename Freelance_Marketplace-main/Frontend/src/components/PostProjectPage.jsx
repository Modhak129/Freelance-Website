import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    budget: '',
    deadline_days: ''
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

    if (requiredSkills.length === 0) {
      setError('Please select at least one Required Skill.');
      window.scrollTo(0, 0); 
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget),
        deadline_days: parseInt(formData.deadline_days),
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

  // --- REUSABLE STYLES TO MATCH AUTH PAGE ---
  const inputStyle = "w-full px-4 py-3 bg-white border-2 border-gray-800 rounded-lg shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] focus:outline-none focus:border-indigo-500 focus:shadow-[6px_6px_0px_0px_rgba(99,102,241,1)] focus:-translate-y-0.5 transition-all text-gray-900 placeholder-gray-500 font-medium";
  
  const labelStyle = "block text-sm font-bold text-gray-800 mb-1 ml-1";

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center">
      
      {/* --- MAIN CARD --- */}
      <div className="bg-white border-2 border-gray-800 p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] w-full max-w-2xl">
        
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 uppercase tracking-tight">
          Post a Project
        </h1>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Input */}
          <div>
            <label className={labelStyle}>
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. E-commerce Website Redesign"
              className={inputStyle}
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description Input */}
          <div>
            <label className={labelStyle}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows="5"
              placeholder="Describe the project details, deliverables, and timeline..."
              className={inputStyle}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Skills Section */}
          <div>
            <label className={labelStyle}>
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-5 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]`}>
              {AVAILABLE_SKILLS.map((skill) => (
                <label key={skill} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-gray-300">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded border-2 border-gray-600 focus:ring-indigo-500 cursor-pointer"
                    checked={requiredSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <span className="text-gray-800 font-bold text-sm">{skill}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 font-bold ml-1">Select the skills freelancers need for this job.</p>
          </div>

          {/* Grid for Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Input */}
            <div>
              <label className={labelStyle}>
                Budget ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget"
                required
                min="1"
                step="0.01"
                placeholder="500.00"
                className={inputStyle}
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            {/* Deadline Input */}
            <div>
              <label className={labelStyle}>
                Timeline (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="deadline_days"
                required
                min="2"
                placeholder="e.g. 7"
                className={inputStyle}
                value={formData.deadline_days}
                onChange={(e) => setFormData({ ...formData, deadline_days: e.target.value })}
                onBlur={(e) => {
                   if(e.target.value !== "" && parseInt(e.target.value) < 2) {
                      setFormData({ ...formData, deadline_days: "2" });
                   }
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] mt-4 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]'
            }`}
          >
            {loading ? 'Publishing Project...' : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
}