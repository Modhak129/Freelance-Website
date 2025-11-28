import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  
  // Parse skills string into array
  // We limit to 6 tags on the front to prevent overflow, or you can remove .slice() to show all
  const skills = project.required_skills 
    ? project.required_skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5) 
    : [];

  return (
    <StyledWrapper>
      <div className="flip-card">
        <div className="flip-card-inner">

          {/* --- FRONT OF CARD --- */}
          <div className="flip-card-front">
            <div className="corner-bubble">
               <span className="corner-text">#</span> 
            </div>
            
            <div className="card-content">
              <h3 className="card-title">{project.title}</h3>
              <p className="card-subtitle">
                 Budget: <span className="budget-highlight">${project.budget}</span>
              </p>

              {/* --- SKILLS ON FRONT --- */}
              <div className="skills-label">Required Skills:</div>
              <div className="skills-container">
                {skills.length > 0 ? (
                  skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))
                ) : (
                  <span className="no-skills">No specific skills listed</span>
                )}
                {project.required_skills && project.required_skills.split(',').length > 5 && (
                  <span className="skill-tag-more">...</span>
                )}
              </div>
            </div>
            
            <div className="posted-by">
              Posted by {project.client?.username || "Client"}
            </div>
          </div>

          {/* --- BACK OF CARD --- */}
          <div className="flip-card-back">
            <h4 className="back-title">Project Details</h4>
            
            <p className="back-description">
              {project.description.length > 120
                ? project.description.substring(0, 120) + '...' 
                : project.description}
            </p>
            
            <Link 
              to={`/project/${project.id}`}
              className="view-details-button"
            >
              View Details & Bid
            </Link>
          </div>

        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .flip-card {
    background-color: transparent;
    width: 280px; 
    height: 320px;
    perspective: 1000px;
    margin: 0 auto;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: left;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1rem;
    background-color: white;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    color: #1f2937; /* Forced Dark Text */
  }

  /* --- FRONT FACE STYLING --- */
  .flip-card-front {
    z-index: 2;
    transform: rotateY(0deg);
    justify-content: space-between; /* Pushes "Posted by" to bottom */
  }

  .corner-bubble {
    position: absolute;
    top: 0;
    right: 0;
    width: 70px; /* Smaller bubble */
    height: 70px;
    background-color: #8B5CF6;
    border-bottom-left-radius: 100%;
    border-top-right-radius: 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 1rem;
  }

  .corner-text {
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .card-content {
    margin-top: 1.5rem; /* Space from top */
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1F2937;
    margin-bottom: 0.5rem;
    line-height: 1.2;
    /* Limit title to 2 lines */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-subtitle {
    font-size: 1.1rem;
    font-weight: 600;
    color: #4B5563;
    margin-bottom: 1.5rem;
  }

  .budget-highlight {
    color: #8B5CF6;
  }

  /* Skills Styling */
  .skills-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #9CA3AF;
    font-weight: 700;
    margin-bottom: 0.5rem;
    letter-spacing: 0.5px;
  }

  .skills-container {
    display: flex;
    flex-wrap: wrap; /* FLEXIBLE WRAPPING */
    gap: 6px;
    margin-bottom: 1rem;
  }
  
  .skill-tag {
    font-size: 0.75rem;
    background-color: #EDE9FE; /* Light Purple */
    color: #6D28D9;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .skill-tag-more {
    font-size: 0.75rem;
    color: #6D28D9;
    padding: 4px;
  }
  
  .no-skills {
    font-size: 0.8rem;
    color: #9CA3AF;
    font-style: italic;
  }

  .posted-by {
    font-size: 0.85rem;
    color: #9CA3AF;
    font-weight: 500;
    border-top: 1px solid #E5E7EB;
    padding-top: 1rem;
  }

  /* --- BACK FACE STYLING --- */
  .flip-card-back {
    transform: rotateY(180deg);
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: #F3F4F6;
    padding: 2rem;
  }

  .back-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 1rem;
  }

  .back-description {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .view-details-button {
    background-color: #8B5CF6;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 2rem;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 4px 6px rgba(139, 92, 246, 0.25);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .view-details-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(139, 92, 246, 0.35);
  }
`;

export default ProjectCard;