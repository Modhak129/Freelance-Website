import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BidDetailsModal from './BidDetailsModal';
import ReviewModal from './ReviewModal';

const BIDS_PER_PAGE = 8;

const AVAILABLE_SKILLS = [
  "Web Development", "App Development", "UI/UX Design", "Python", "Java",
  "React.js", "Node.js", "Data Analysis", "Content Writing", "Digital Marketing",
  "SEO", "Graphic Design"
];

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankingPriority, setRankingPriority] = useState('balanced');
  
  // --- STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', description: '', budget: '', deadline_days: '', status: '', required_skills: [] 
  });

  // Bidding & Reviews
  const [bidAmount, setBidAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [days, setDays] = useState('');
  const [bidMsg, setBidMsg] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Modals
  const [bidPage, setBidPage] = useState(1);
  const [selectedBid, setSelectedBid] = useState(null);

  // --- 1. REF FOR SCROLLING ---
  const bidsRef = useRef(null);

  // --- FETCH ---
  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/project/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  // --- HELPER VARIABLES ---
  const isClient = user && project && (
    (project.client_id && user.id === project.client_id) || 
    (project.client && user.id === project.client.id)
  );

  const isAssignedFreelancer = user && project && (
    (project.freelancer_id && user.id === project.freelancer_id) ||
    (project.freelancer && user.id === project.freelancer.id)
  );
  
  const isFreelancer = user && user.is_freelancer;
  const skillsList = project?.required_skills ? project.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  // --- HELPER FUNCTIONS ---
  const userHasReviewed = () => {
    if (!user || !project?.reviews) return false;
    return project.reviews.some(review => review.reviewer_id === user.id);
  }

  const getTimeStatus = () => {
    if (!project.started_at || !project.deadline_days) return <span className="text-gray-500 font-medium">{project.deadline_days || 7} Days Delivery</span>;
    if (project.status === 'completed' || project.status === 'pending_review') return <span className="text-green-600 font-bold">✓ Completed</span>;
    const start = new Date(project.started_at).getTime();
    const deadline = start + (project.deadline_days * 24 * 60 * 60 * 1000);
    const now = Date.now();
    const diff = deadline - now;
    if (diff > 0) {
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return <span className="text-indigo-600 font-bold">⏱ {daysLeft} days remaining</span>;
    } else {
      const daysOver = Math.abs(Math.ceil(diff / (1000 * 60 * 60 * 24)));
      return <span className="text-red-600 font-bold">⚠ Overdue by {daysOver} days</span>;
    }
  };

  // --- HANDLERS ---
  const handleCompleteWork = async () => {
    try { await axios.post(`/project/${id}/complete`); fetchProject(); } 
    catch (err) { alert("Failed to submit work"); }
  };
  const handleRequestRevision = async () => {
    try { await axios.post(`/project/${id}/request_revision`); fetchProject(); } 
    catch (err) { alert("Failed to request revision"); }
  };
  const handleAcceptCompletedWork = async () => {
    try { await axios.post(`/project/${id}/accept`); fetchProject(); } 
    catch (err) { alert("Failed to accept work"); }
  };
  const handlePostReview = async (rating, comment) => {
    try {
      await axios.post(`/project/${id}/review`, { rating, comment });
      setShowReviewModal(false);
      fetchProject();
    } catch (err) { alert(err.response?.data?.msg || "Failed to post review"); }
  };
  
  const handleEditClick = () => {
    const skillsArray = project.required_skills ? project.required_skills.split(',').map(s => s.trim()) : [];
    setEditForm({
      title: project.title, 
      description: project.description, 
      budget: project.budget, 
      deadline_days: project.deadline_days || 7, 
      status: project.status, 
      required_skills: skillsArray
    });
    setIsEditing(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...editForm, 
        budget: parseFloat(editForm.budget), 
        deadline_days: parseInt(editForm.deadline_days), 
        required_skills: editForm.required_skills.join(',') 
      };
      await axios.put(`/project/${project.id}`, payload);
      setIsEditing(false);
      fetchProject(); 
    } catch (err) { alert("Failed to update project"); }
  };

  const handleRank = async () => {
    try {
      const res = await axios.post('/rank_bids', { project_id: project.id, priority: rankingPriority });
      if (res.data.ranked_bids) { 
        setProject(prev => ({ ...prev, bids: res.data.ranked_bids })); 
        setBidPage(1); 
        // Scroll to top of list after ranking
        if (bidsRef.current) bidsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) { console.error("Ranking failed", err); }
  };

  const handleAcceptBid = async (bidId) => {
    if(!window.confirm("Accept this bid? Timer will start immediately.")) return;
    try { await axios.post(`/project/${project.id}/accept_bid`, { bid_id: bidId }); fetchProject(); } 
    catch(err) { alert("Failed to accept bid"); }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/project/${project.id}/bid`, { amount: parseFloat(bidAmount), proposal, proposed_timeline_days: parseInt(days, 10) });
      setBidMsg("Bid placed successfully!"); setBidAmount(''); setProposal(''); setDays(''); fetchProject(); 
    } catch (err) { setBidMsg("Failed to place bid."); }
  };

  if (loading) return <div className="text-center text-white py-10">Loading Project...</div>;
  if (!project) return <div className="text-center text-white py-10">Project not found.</div>;

  const renderActionPanel = () => {
    if (isAssignedFreelancer) {
      if (project.status === 'in_progress' || project.status === 'needs_revision') {
        return (
          <div className="text-center">
            <button onClick={handleCompleteWork} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
              Submit Work for Review
            </button>
            {project.status === 'needs_revision' && <p className="text-yellow-700 mt-2 font-medium">⚠ Client requested revisions.</p>}
          </div>
        );
      }
      if (project.status === 'pending_review') return <p className="text-center font-semibold text-gray-700">Work submitted. Waiting for approval.</p>;
      if (project.status === 'completed' && !userHasReviewed()) return <div className="text-center"><button onClick={() => setShowReviewModal(true)} className="px-4 py-2 bg-gray-800 text-white rounded">Review Client</button></div>;
    }
    if (isClient) {
      if (project.status === 'pending_review') {
        return (
          <div className="text-center space-x-4">
            <p className="text-lg font-semibold mb-3 text-gray-800">Freelancer has submitted work.</p>
            <button onClick={handleAcceptCompletedWork} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Accept Work</button>
            <button onClick={handleRequestRevision} className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-600">Request Revisions</button>
          </div>
        );
      }
      if (project.status === 'completed' && !userHasReviewed()) return <div className="text-center"><button onClick={() => setShowReviewModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded">Review Freelancer</button></div>;
    }
    return null;
  };

  const allBids = project.bids || [];
  const bidsToDisplay = project.status === 'open' 
    ? allBids 
    : allBids.filter(b => {
        const bidFreelancerId = b.freelancer?.id || b.freelancer_id;
        const projectFreelancerId = project.freelancer?.id || project.freelancer_id;
        return bidFreelancerId === projectFreelancerId;
      });

  // --- 2. PAGINATION HANDLER ---
  const totalBidPages = Math.ceil(bidsToDisplay.length / BIDS_PER_PAGE);
  const indexOfLastBid = bidPage * BIDS_PER_PAGE;
  const indexOfFirstBid = indexOfLastBid - BIDS_PER_PAGE;
  const currentBids = bidsToDisplay.slice(indexOfFirstBid, indexOfLastBid);

  const handleBidPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalBidPages) {
        setBidPage(newPage);
        // Scroll to the "bidsRef" container
        if (bidsRef.current) {
            bidsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {selectedBid && <BidDetailsModal bid={selectedBid} onClose={() => setSelectedBid(null)} />}
      {showReviewModal && <ReviewModal onSubmit={handlePostReview} onClose={() => setShowReviewModal(false)} />}
      
      {/* MAIN CARD */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* --- HEADER --- */}
        <div className="bg-gray-50 p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                  ${project.status === 'open' ? 'bg-green-100 text-green-800' : 
                    project.status === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className="text-gray-500 text-sm">Posted by {project.client?.username}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">{project.title}</h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase font-semibold">Budget</p>
                <p className="text-3xl font-bold text-indigo-600">${project.budget}</p>
              </div>
              <div className="bg-indigo-50 px-3 py-1 rounded border border-indigo-100 text-sm">{getTimeStatus()}</div>
              
              {isClient && !isEditing && (
                <button onClick={handleEditClick} className="mt-2 text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50 transition">
                  Edit Project
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- BODY CONTENT --- */}
        <div className="p-8 space-y-8">
          {!isEditing ? (
            <>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProject} className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-4">
                <p className="text-sm">Note: You can only edit the description. Title, Budget, and Skills are locked.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="6" 
                  className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills (Read-Only)</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 transition">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="border border-gray-300 text-gray-700 px-6 py-2 rounded font-bold hover:bg-gray-50 transition">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* --- ACTION PANEL --- */}
      {project.status !== 'open' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Project Status</h2>
          {renderActionPanel()}
        </div>
      )}

      {/* --- BIDS SECTION --- */}
      {!isEditing && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3. ATTACH REF TO BIDS CONTAINER */}
          <div className="lg:col-span-2" ref={bidsRef}>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {project.status === 'open' ? `Bids (${allBids.length})` : 'Accepted Bid'}
                </h2>
                
                {isClient && project.status === 'open' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none bg-white shadow-sm" value={rankingPriority} onChange={(e) => setRankingPriority(e.target.value)}>
                      <option value="balanced">Balanced</option><option value="price">Price</option><option value="rating">Rating</option><option value="time">Timeline</option>
                    </select>
                    <button onClick={handleRank} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm">Rank</button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {currentBids.length > 0 ? (
                  currentBids.map((bid, index) => {
                    const globalRank = index + 1 + (bidPage - 1) * BIDS_PER_PAGE;
                    return (
                      <div key={bid.id} onClick={() => setSelectedBid(bid)} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white cursor-pointer group flex items-start gap-4">
                        {project.status === 'open' && (
                          <div className="flex flex-col items-center justify-start pt-1 min-w-[3rem]">
                            <span className="text-2xl font-bold text-gray-300 group-hover:text-indigo-500 transition-colors">#{globalRank}</span>
                          </div>
                        )}
                        <div className="grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">${bid.amount}</p>
                                <span className="text-sm font-normal text-gray-500">in {bid.proposed_timeline_days} days</span>
                              </div>
                              <p className="text-sm text-indigo-600 font-medium">Freelancer: {bid.freelancer?.username || 'Unknown'}</p>
                              {bid.score !== undefined && project.status === 'open' && <p className="text-xs text-green-600 font-bold mt-1">Score: {bid.score.toFixed(1)}</p>}
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-xs border px-2 py-1 rounded bg-white text-gray-600">View</span>
                              {isClient && project.status === 'open' && (
                                <button onClick={(e) => { e.stopPropagation(); handleAcceptBid(bid.id); }} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 z-10 relative">Accept</button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 mt-3 text-sm line-clamp-2">{bid.proposal}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (<p className="text-gray-500 text-center py-4">{project.status === 'open' ? "No bids yet." : "Accepted bid details unavailable."}</p>)}
              </div>

              {bidsToDisplay.length > BIDS_PER_PAGE && (
                <div className="flex justify-center mt-6 gap-2">
                  <button onClick={() => handleBidPageChange(bidPage - 1)} disabled={bidPage === 1} className="px-3 py-1 rounded text-sm bg-gray-100">Prev</button>
                  <span className="text-sm text-gray-600 self-center">Page {bidPage} of {totalBidPages}</span>
                  <button onClick={() => handleBidPageChange(bidPage + 1)} disabled={bidPage === totalBidPages} className="px-3 py-1 rounded text-sm bg-gray-100">Next</button>
                </div>
              )}
            </div>
          </div>

          {/* Place Bid Form */}
          {isFreelancer && project.status === 'open' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Place a Bid</h3>
                {bidMsg && <div className="p-3 rounded mb-4 text-sm bg-green-100 text-green-700">{bidMsg}</div>}
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <input type="number" required className="w-full border border-gray-300 rounded p-2 text-gray-900" placeholder="Amount ($)" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                  <input type="number" required className="w-full border border-gray-300 rounded p-2 text-gray-900" placeholder="Days" value={days} onChange={e => setDays(e.target.value)} />
                  <textarea required rows="4" className="w-full border border-gray-300 rounded p-2 text-gray-900" placeholder="Proposal" value={proposal} onChange={e => setProposal(e.target.value)}></textarea>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 transition">Submit</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}