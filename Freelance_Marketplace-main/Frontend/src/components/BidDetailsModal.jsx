import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BidDetailsModal({ bid, onClose }) {
  const [fullProfile, setFullProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the full profile to get Reviews and detailed stats
  useEffect(() => {
    const fetchFreelancerDetails = async () => {
      try {
        const res = await axios.get(`/user/${bid.freelancer.id}`);
        setFullProfile(res.data);
      } catch (err) {
        console.error("Failed to load freelancer details", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (bid?.freelancer?.id) {
      fetchFreelancerDetails();
    }
  }, [bid]);

  if (!bid) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT SIDE: Bid Details (30%) */}
        <div className="md:w-1/3 bg-gray-50 p-8 border-r border-gray-200 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bid Amount</h3>
            <p className="text-3xl font-extrabold text-indigo-600">${bid.amount}</p>
            <p className="text-sm text-gray-500 font-medium">{bid.proposed_timeline_days} Days Delivery</p>
          </div>

          {bid.score !== undefined && (
            <div className="mb-6 bg-green-100 border border-green-200 p-3 rounded-lg">
              <p className="text-green-800 text-xs font-bold uppercase">AI Rank Score</p>
              <p className="text-2xl font-bold text-green-700">{bid.score.toFixed(1)} / 10</p>
            </div>
          )}

          <div className="grow">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Proposal</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed h-full max-h-60 overflow-y-auto whitespace-pre-wrap">
              {bid.proposal}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Freelancer Profile (70%) */}
        <div className="md:w-2/3 p-8 bg-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          >
            &times;
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-full">Loading Profile...</div>
          ) : fullProfile ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {fullProfile.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{fullProfile.username}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>★ {Number(fullProfile.avg_rating || 0).toFixed(1)} Rating</span>
                    <span>• {fullProfile.projects_completed || 0} Projects Completed</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-600">{fullProfile.on_time_count || 0}</p>
                  <p className="text-xs text-blue-800 font-semibold">On Time</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-xl font-bold text-orange-600">{fullProfile.delayed_count || 0}</p>
                  <p className="text-xs text-orange-800 font-semibold">Delayed</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-xl font-bold text-purple-600">
                    {fullProfile.external_reviews_count ? "Yes" : "No"}
                  </p>
                  <p className="text-xs text-purple-800 font-semibold">External Data</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {fullProfile.bio || "No bio provided."}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {fullProfile.skills ? (
                    fullProfile.skills.split(',').map((skill, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No skills listed.</span>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Reviews List */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {fullProfile.reviews_received && fullProfile.reviews_received.length > 0 ? (
                    fullProfile.reviews_received.map(review => (
                      <div key={review.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-gray-700">
                            {review.reviewer?.username || 'Client'}
                          </span>
                          <span className="text-yellow-500 text-xs font-bold">
                            {'★'.repeat(review.rating)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No reviews yet.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-red-500">Failed to load profile.</div>
          )}
        </div>
      </div>
    </div>
  );
}