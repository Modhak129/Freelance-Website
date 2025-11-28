import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AVAILABLE_SKILLS = [
  "Web Development", "App Development", "UI/UX Design", "Python", "Java",
  "React.js", "Node.js", "Data Analysis", "Content Writing", "Digital Marketing",
  "SEO", "Graphic Design"
];

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  // --- State ---
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]); 
  
  // Import Feature State
  const [freelancerImportName, setFreelancerImportName] = useState("");
  const [importStatus, setImportStatus] = useState(null);

  // Compulsory Setup Flag
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  const isCurrentUser = currentUser?.id === parseInt(id, 10);

  // --- Fetch Profile & Check Compulsory Fields ---
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/user/${id}`);
      const p = res.data;
      setProfile(p);
      
      // Populate Edit State
      setEditBio(p.bio || '');
      if (p.skills) {
        setSelectedSkills(p.skills.split(',').map(s => s.trim()));
      } else {
        setSelectedSkills([]);
      }

      // Logic: Force setup if fields are missing for the logged-in user
      if (isCurrentUser) {
        const missingBio = !p.bio || p.bio.trim() === '';
        const missingSkills = p.is_freelancer && (!p.skills || p.skills.trim() === '');
        
        if (missingBio || missingSkills) {
          setIsEditing(true);
          setIsSetupRequired(true); // Hides the "Cancel" button
        }
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [id]);

  // --- Handlers ---

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill);
      else return [...prev, skill];
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsString = selectedSkills.join(',');
      await axios.put('/user/profile', { bio: editBio, skills: skillsString });
      
      setIsEditing(false);
      setIsSetupRequired(false); // Setup complete
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile.');
    }
  };

  const handleImportSubmit = async () => {
    if (!freelancerImportName.trim()) return;
    setImportStatus("Loading...");
    try {
      const res = await axios.post('/user/import_freelancer_rating', {
        username: freelancerImportName.trim()
      });
      const data = res.data;
      // Update local state immediately to lock the button
      setProfile((prev) => ({ 
        ...prev, 
        avg_rating: data.rating, 
        freelancer_username: freelancerImportName.trim(), 
        external_reviews_count: data.reviews 
      }));
      setImportStatus(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to import.";
      setImportStatus("❌ " + errorMsg);
    }
  };

  if (loading) return <div className="container mx-auto py-8 px-4 text-center">Loading profile...</div>;
  if (error) return <div className="container mx-auto py-8 px-4 text-red-500 text-center">{error}</div>;
  if (!profile) return null;

  const displaySkills = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="container mx-auto py-8 px-4">
      
      {/* --- 1. COMPULSORY SETUP ALERT --- */}
      {isSetupRequired && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded shadow-md animate-pulse">
          <p className="font-bold text-lg">Account Setup Required</p>
          <p className="mt-1">
            Welcome! Please complete your <strong>Bio</strong> {profile.is_freelancer && "and select your **Skills**"} to continue.
          </p>
        </div>
      )}

      {/* --- 2. MAIN PROFILE CARD --- */}
      <div className="card p-8 bg-white shadow-xl rounded-lg border border-gray-100 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{profile.username}</h1>
            <p className="text-lg text-indigo-600 font-medium">{profile.is_freelancer ? 'Freelancer' : 'Client'}</p>
            
            {/* Rating Badge (Only if not editing) */}
            {profile.is_freelancer && !isEditing && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-800">
                  Rating: {Number(profile.avg_rating || 0).toFixed(1)} / 5.0
                </p>
                {profile.freelancer_username && (
                   <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                     Verified Import
                   </span>
                )}
              </div>
            )}
          </div>

          {/* Edit Button (Hidden if already editing or not owner) */}
          {isCurrentUser && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        <hr className="my-6 border-gray-200" />

        {/* --- VIEW MODE --- */}
        {!isEditing ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bio</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
            </div>

            {profile.is_freelancer && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {displaySkills.length > 0 ? (
                    displaySkills.map((skill, i) => (
                      <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills listed.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- EDIT MODE --- */
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                rows="4"
                required
                placeholder="Tell us about your experience and expertise..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            {profile.is_freelancer && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Select Skills <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-gray-200 p-4 rounded-lg bg-gray-50">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                      />
                      <span className="text-gray-700 font-medium">{skill}</span>
                    </label>
                  ))}
                </div>
                {selectedSkills.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 font-semibold">At least one skill is required.</p>
                )}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={profile.is_freelancer && selectedSkills.length === 0}
                className={`px-6 py-3 text-white font-bold rounded-lg shadow transition-transform transform hover:-translate-y-0.5 ${
                    (profile.is_freelancer && selectedSkills.length === 0) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                Save & Continue
              </button>
              
              {/* Hide Cancel button if setup is compulsory */}
              {!isSetupRequired && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditBio(profile.bio || '');
                    if (profile.skills) setSelectedSkills(profile.skills.split(',').map(s => s.trim()));
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* --- 3. FREELANCER SECTIONS --- */}
      {profile.is_freelancer && !isEditing && (
        <>
          {/* Import Rating (Current User Only) */}
          {isCurrentUser && (
            <div className="card p-6 border border-gray-200 rounded-lg mt-8 bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Import Freelancer.com Rating</h2>
              
              {profile.freelancer_username ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-4">
                  <div className="text-2xl bg-green-200 w-10 h-10 flex items-center justify-center rounded-full">✓</div>
                  <div>
                    <p className="font-bold">Successfully Imported</p>
                    <p className="text-sm">Linked to <strong>@{profile.freelancer_username}</strong></p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4 text-sm">
                    Enter your Freelancer.com username to import your rating. 
                    <span className="text-red-500 font-semibold ml-1">* One-time use only.</span>
                  </p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Username"
                      value={freelancerImportName}
                      onChange={(e) => setFreelancerImportName(e.target.value)}
                      className="border border-gray-300 px-4 py-2 rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                      disabled={importStatus === "Loading..."}
                    />
                    <button
                      className={`px-5 py-2 text-white rounded-lg font-medium transition-colors ${
                        importStatus === "Loading..." ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                      onClick={handleImportSubmit}
                      disabled={importStatus === "Loading..."}
                    >
                      {importStatus === "Loading..." ? "Importing..." : "Import"}
                    </button>
                  </div>
                  {importStatus && !importStatus.startsWith("Loading") && (
                    <p className="mt-3 text-sm font-bold text-red-600">{importStatus}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Accepted Projects List */}
          <div className="card p-8 mt-8 bg-white shadow-xl rounded-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4 border-gray-200">
              Accepted Projects
            </h2>
            <div className="space-y-4">
              {profile.accepted_projects && profile.accepted_projects.length > 0 ? (
                profile.accepted_projects.map((project) => (
                  <div key={project.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-200 p-5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="mb-4 md:mb-0">
                      <Link to={`/project/${project.id}`} className="text-xl font-bold text-indigo-600 hover:underline block mb-1">
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">Client: {project.client?.username || 'N/A'}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                          ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/project/${project.id}`}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:text-indigo-600 hover:border-indigo-600 transition-all font-medium whitespace-nowrap"
                    >
                      View Project
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                  <p className="text-gray-500">No accepted projects yet.</p>
                  {isCurrentUser && (
                    <Link to="/projects" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                      Browse Open Jobs
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- 4. CLIENT SECTIONS --- */}
      {!profile.is_freelancer && !isEditing && (
        <div className="card p-8 mt-8 bg-white shadow-xl rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Posted Projects</h2>
            {isCurrentUser && (
              <Link to="/post-project" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                + New Project
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {profile.posted_projects && profile.posted_projects.length > 0 ? (
              profile.posted_projects.map((project) => (
                <div key={project.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-200 p-5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mb-4 md:mb-0">
                    <Link to={`/project/${project.id}`} className="text-xl font-bold text-indigo-600 hover:underline block mb-1">
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                        ${project.status === 'open' ? 'bg-green-100 text-green-800' : 
                          project.status === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                        {project.status}
                      </span>
                      <span className="font-medium">Budget: ${project.budget}</span>
                    </div>
                  </div>
                  <Link
                    to={`/project/${project.id}`}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:text-indigo-600 hover:border-indigo-600 transition-all font-medium whitespace-nowrap"
                  >
                    View & Manage
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500 mb-3">You haven't posted any projects yet.</p>
                {isCurrentUser && (
                  <Link to="/post-project" className="text-indigo-600 font-semibold hover:underline">
                    Post your first job now
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 5. REVIEWS SECTION (Shared) --- */}
      {!isEditing && (
        <div className="card p-8 mt-8 bg-white shadow-xl rounded-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4 border-gray-200">
            Reviews Received
          </h2>
          
          <div className="space-y-6">
            {profile.reviews_received && profile.reviews_received.length > 0 ? (
              profile.reviews_received.map((review) => (
                <div key={review.id} className="border border-gray-200 p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 text-lg">
                      {review.reviewer?.username || 'Anonymous'}
                    </span>
                    <span className="text-yellow-500 font-bold text-lg">
                      {'★'.repeat(review.rating)}
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                    </span>
                  </div>
                  <p className="text-gray-700 italic mb-2">"{review.comment}"</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Project: {review.project?.title || 'Unknown Project'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 italic">
                <p>No reviews received yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}