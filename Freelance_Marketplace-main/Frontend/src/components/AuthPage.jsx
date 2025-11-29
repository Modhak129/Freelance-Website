import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimatedCheckbox from '../styles/AnimatedCheckbox';

// --- STYLED COMPONENTS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// NEW: Error Banner that floats on top of everything (z-index: 9999)
const ErrorBanner = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999; /* Higher than Navbar */
  background-color: #ff4d4d;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${fadeIn} 0.3s ease-out;
  border: 2px solid #cc0000;
  min-width: 300px;
  justify-content: center;
`;

const SuccessBanner = styled(ErrorBanner)`
  background-color: #4caf50;
  border-color: #388e3c;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh; 
  background-color: transparent; 
  padding: 20px;
`;

const CardSwitch = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  width: 100%;
  height: 100%;
`;

const FlipCardInner = styled.div`
  width: 350px;
  height: 500px; /* Fixed height for consistent flip */
  position: relative;
  perspective: 1000px;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${({ isFlipped }) => (isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
`;

const FlipCardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
  border-radius: 20px;
  background: #fff; /* White card */
  border: 3px solid #000;
  box-shadow: 10px 10px 0px #000; /* Brutalist shadow */
`;

const FlipCardBack = styled(FlipCardFront)`
  transform: rotateY(180deg);
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  color: #000;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #000;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  background: #f9f9f9;
  transition: all 0.2s;

  &:focus {
    background: #fff;
    border-color: #22c55e; /* Green focus */
    box-shadow: 4px 4px 0px #000;
    transform: translate(-2px, -2px);
  }
`;

const SubmitButton = styled.button`
  margin-top: 15px;
  padding: 14px;
  background: #000;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
  box-shadow: 4px 4px 0px #666;

  &:hover {
    background: #333;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #666;
  }
  
  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px #666;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const SwitchText = styled.p`
  margin-top: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #000;
  }
`;

// --- MAIN COMPONENT ---

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isFlipped, setIsFlipped] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isFreelancer, setIsFreelancer] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Flip based on URL
  useEffect(() => {
    if (location.pathname === '/register') setIsFlipped(true);
    else setIsFlipped(false);
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (result) {
        navigate('/profile');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!regUsername || !regEmail || !regPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await register(regUsername, regEmail, regPassword, isFreelancer);
      if (result) {
        setSuccess("Registration successful! Logging you in...");
        setTimeout(() => {
             // Optional: Auto login after register
             login(regEmail, regPassword).then(() => navigate('/profile'));
        }, 1500);
      } else {
        setError('Registration failed. Username or email might be taken.');
      }
    } catch (err) {
       setError('Server error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setError('');
    setSuccess('');
    // Update URL without refreshing
    if (isFlipped) navigate('/login');
    else navigate('/register');
  };

  return (
    <Wrapper>
      {/* --- ERROR BANNER (FLOATING ON TOP) --- */}
      {error && (
        <ErrorBanner>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
        </ErrorBanner>
      )}

      {/* --- SUCCESS BANNER --- */}
      {success && (
        <SuccessBanner>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {success}
        </SuccessBanner>
      )}

      <CardSwitch>
        <FlipCardInner isFlipped={isFlipped}>
          
          {/* FRONT: LOGIN */}
          <FlipCardFront>
            <Title>Log In</Title>
            <Form onSubmit={handleLogin}>
              <InputGroup>
                <Label>Email</Label>
                <Input 
                    type="email" 
                    placeholder="Enter email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                />
              </InputGroup>
              <InputGroup>
                <Label>Password</Label>
                <Input 
                    type="password" 
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                />
              </InputGroup>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Access Account'}
              </SubmitButton>
            </Form>
            <SwitchText onClick={toggleFlip}>Don't have an account? Register now.</SwitchText>
          </FlipCardFront>

          {/* BACK: REGISTER */}
          <FlipCardBack>
            <Title>Register</Title>
            <Form onSubmit={handleRegister}>
              <InputGroup>
                <Label>Username</Label>
                <Input 
                    type="text" 
                    placeholder="Pick a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                />
              </InputGroup>
              <InputGroup>
                <Label>Email</Label>
                <Input 
                    type="email" 
                    placeholder="Email address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                />
              </InputGroup>
              <InputGroup>
                <Label>Password</Label>
                <Input 
                    type="password" 
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                />
              </InputGroup>
              
              {/* Checkbox for Freelancer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
                 <AnimatedCheckbox 
                    label="I am a Freelancer"
                    checked={isFreelancer}
                    onChange={(e) => setIsFreelancer(e.target.checked)}
                 />
              </div>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </SubmitButton>
            </Form>
            <SwitchText onClick={toggleFlip}>Already have an account? Log in.</SwitchText>
          </FlipCardBack>

        </FlipCardInner>
      </CardSwitch>
    </Wrapper>
  );
};

export default AuthPage;