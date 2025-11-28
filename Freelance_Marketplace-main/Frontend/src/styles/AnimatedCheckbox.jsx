import React from 'react';
import styled from 'styled-components';

const AnimatedCheckbox = ({ checked, onChange, label }) => {
  return (
    <StyledWrapper 
      onClick={(e) => {
        // --- CRITICAL FIX ---
        e.preventDefault(); // Prevents default label behavior
        e.stopPropagation(); // Stops the click from reaching the parent Flip Card
        // --------------------
        onChange(!checked);
      }}
    >
      <div className="checkbox-container">
        <div className="checkbox-wrapper">
          {/* Controlled Checkbox */}
          <input 
            className="checkbox" 
            type="checkbox" 
            checked={checked} 
            readOnly 
          />
          <div className="checkbox-label">
            <div className="checkbox-flip">
              
              {/* FRONT: X Icon (Client / Default) */}
              <div className="checkbox-front">
                <svg fill="none" height={32} width={32} viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              
              {/* BACK: Checkmark (Freelancer / Selected) */}
              <div className="checkbox-back">
                <svg fill="none" height={32} width={32} viewBox="0 0 24 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              
            </div>
          </div>
        </div>
        {label && <span className="label-text">{label}</span>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  cursor: pointer;
  display: inline-block;

  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .checkbox {
    display: none;
  }

  .checkbox-label {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  /* Reduce size slightly to fit form better (40px vs 60px) */
  .checkbox-flip {
    width: 40px;
    height: 40px;
    perspective: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: transform 0.4s ease;
  }

  .checkbox-front,
  .checkbox-back {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px; 
    backface-visibility: hidden;
    transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55); 
  }

  /* Front (Unchecked/Client) - Red/Orange Gradient */
  .checkbox-front {
    background: linear-gradient(135deg, #ff6347, #f76c6c);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: rotateY(0deg);
  }

  /* Back (Checked/Freelancer) - Green/Teal Gradient */
  .checkbox-back {
    background: linear-gradient(135deg, #36b54a, #00c1d4);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: rotateY(180deg);
  }

  .checkbox-wrapper:hover .checkbox-flip {
    transform: scale(1.05);
  }

  /* Logic: If wrapper checked prop is true, rotate */
  .checkbox:checked + .checkbox-label .checkbox-front {
    transform: rotateY(-180deg);
  }

  .checkbox:checked + .checkbox-label .checkbox-back {
    transform: rotateY(0deg);
  }

  .label-text {
    font-weight: 600;
    color: var(--main-color, #333);
    font-size: 16px;
    user-select: none;
  }
`;

export default AnimatedCheckbox;