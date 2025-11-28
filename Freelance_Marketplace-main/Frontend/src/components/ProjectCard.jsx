import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  
  const skills = project.required_skills 
    ? project.required_skills.split(',').map(s => s.trim()).filter(Boolean)
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
              {/* Title Section */}
              <div className="title-container">
                <h3 className="card-title" title={project.title}>
                  {project.title}
                </h3>
              </div>
              
              <div className="budget-container">
                <p className="card-subtitle">
                   Budget: <span className="budget-highlight">${project.budget}</span>
                </p>
              </div>

              <div className="skills-section">
                <div className="skills-label">Required Skills:</div>
                <div className="skills-container">
                  {skills.length > 0 ? (
                    skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <span className="no-skills">No specific skills listed</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="posted-by">
              Posted by {project.client?.username || "Client"}
            </div>
          </div>

          {/* --- BACK OF CARD --- */}
          <div className="flip-card-back">
            <div className="back-content">
              <h4 className="back-title">Project Details</h4>
              <p className="back-description">
                {project.description.length > 150
                  ? project.description.substring(0, 150) + '...' 
                  : project.description}
              </p>
            </div>
            
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
    width: 340px;
    height: 380px; /* Increased height slightly to prevent cramping */
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
    
    display: flex;
    flex-direction: column;
    padding: 2rem;
    overflow: hidden; 
    color: #1f2937;
  }

  /* --- FRONT FACE --- */
  .flip-card-front {
    z-index: 2;
    transform: rotateY(0deg);
  }

  .card-content {
    margin-top: 1.5rem;
    flex-grow: 1; 
    display: flex;
    flex-direction: column;
    /* This ensures items stack naturally without overlap */
    gap: 0.5rem; 
    overflow: hidden; 
  }

  .corner-bubble {
    position: absolute;
    top: 0;
    right: 0;
    width: 75px;
    height: 75px;
    background-color: #8B5CF6;
    border-bottom-left-radius: 100%;
    border-top-right-radius: 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 1.2rem;
  }

  .corner-text {
    color: white;
    font-size: 1.3rem;
    font-weight: 600;
  }

  /* --- TITLE CONTAINER --- */
  .title-container {
    /* Fixed height to reserve space for 3 lines max */
    min-height: 5.5rem; 
    margin-bottom: 0.5rem; /* Explicit space between Title and Budget */
  }

  .card-title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1F2937;
    line-height: 1.3; /* Better line spacing */
    
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* --- BUDGET CONTAINER --- */
  .budget-container {
    margin-bottom: 1rem; /* Space between Budget and Skills */
  }

  .card-subtitle {
    font-size: 1.1rem;
    font-weight: 600;
    color: #4B5563;
    margin: 0; /* Remove default margins to control spacing manually */
  }

  .budget-highlight {
    color: #8B5CF6;
  }

  /* --- SKILLS SECTION --- */
  .skills-section {
    margin-top: auto; /* Push skills towards the bottom of the content area */
  }

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
    flex-wrap: wrap;
    gap: 6px;
    align-content: flex-start;
    height: 85px; /* Fixed height for skills area */
    overflow: hidden; 
  }
  
  .skill-tag {
    font-size: 0.8rem; 
    background-color: #EDE9FE;
    color: #6D28D9;
    padding: 5px 12px;
    border-radius: 12px;
    font-weight: 600;
    white-space: nowrap;
    margin-bottom: 2px;
  }
  
  .no-skills {
    font-size: 0.8rem;
    color: #9CA3AF;
    font-style: italic;
  }

  /* Footer Styling */
  .posted-by {
    font-size: 0.9rem;
    color: #9CA3AF;
    font-weight: 500;
    border-top: 1px solid #E5E7EB;
    padding-top: 1rem;
    margin-top: 1rem; 
    flex-shrink: 0;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* --- BACK FACE --- */
  .flip-card-back {
    transform: rotateY(180deg);
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: #F3F4F6;
  }

  .back-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    overflow: hidden;
  }

  .back-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 1rem;
  }

  .back-description {
    font-size: 1rem;
    color: #555;
    line-height: 1.6;
    max-height: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
  }

  .view-details-button {
    margin-top: auto;
    margin-bottom: 1rem;
    background-color: #8B5CF6;
    color: white;
    padding: 0.8rem 2.5rem;
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