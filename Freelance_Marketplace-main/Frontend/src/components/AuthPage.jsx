import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimatedCheckbox from '../styles/AnimatedCheckbox';

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
      if (result === true || (result && (result.ok || result.success))) {
        const userId = result.user?.id || result.data?.user?.id;
        if(userId) navigate(`/profile/${userId}`);
        else navigate('/projects');
      } else {
        setError(result?.message || result?.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const ok = await register(regUsername, regEmail, regPassword, isFreelancer);
      if (ok) {
        setSuccess('Account created! Logging you in...');
        setTimeout(async () => {
            try {
                const loginResult = await login(regEmail, regPassword);
                if (loginResult === true || (loginResult && (loginResult.ok || loginResult.success))) {
                    const userId = loginResult.user?.id || loginResult.data?.user?.id;
                    if (userId) navigate(`/profile/${userId}`);
                    else navigate('/projects'); 
                } else {
                    throw new Error("Auto-login failed");
                }
            } catch (loginErr) {
                setSuccess('Registration successful! Please log in manually.');
                setTimeout(() => {
                    setIsFlipped(false);
                    navigate('/login');
                }, 1500);
            }
        }, 500);
      } else {
        setError('Registration failed. Username or Email may be taken.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        {(error || success) && (
          <div className={`status-message ${error ? "error" : "success"}`}>
            {error || success}
          </div>
        )}

        <label className="main-switch-container">
          <input
            type="checkbox"
            className="toggle"
            checked={isFlipped}
            onChange={() => {
              setIsFlipped(!isFlipped);
              setError("");
              setSuccess("");
              navigate(isFlipped ? "/login" : "/register");
            }}
          />

          <div className="switch-ui">
            <span className="slider" />
            <span className="card-side" />
          </div>

          <div className="flip-card__inner">
            {/* FRONT: LOGIN */}
            <div className="flip-card__front">
              <div className="title">Log in</div>
              <form className="flip-card__form" onSubmit={handleLogin}>
                {/* Email Group */}
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    className="flip-card__input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                {/* Password Group */}
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    className="flip-card__input"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <button className="flip-card__btn" disabled={loading}>
                  {loading ? "..." : "Let's go!"}
                </button>
              </form>
            </div>

            {/* BACK: REGISTER */}
            <div className="flip-card__back">
              <div className="title">Sign up</div>
              <form className="flip-card__form" onSubmit={handleRegister}>
                {/* Username Group */}
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input
                    className="flip-card__input"
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>

                {/* Email Group */}
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    className="flip-card__input"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                {/* Password Group */}
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    className="flip-card__input"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <div
                  className="checkbox-wrapper"
                  style={{ marginTop: "15px", justifyContent: "center" }}
                >
                  <AnimatedCheckbox
                    checked={isFreelancer}
                    onChange={setIsFreelancer}
                    label={isFreelancer ? "I am a Freelancer" : "I am a not a Freelancer"}
                  />
                </div>
                <button className="flip-card__btn" disabled={loading}>
                  {loading ? "..." : "Confirm!"}
                </button>
              </form>
            </div>
          </div>
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;

  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 120px; /* Reduced slightly to account for taller form */
  }

  /* Status Message */
  .status-message {
    position: absolute;
    top: -80px;
    white-space: nowrap;
    padding: 14px 28px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    animation: fadeIn 0.3s ease;
    z-index: 10;
  }
  .error { background-color: #ef4444; }
  .success { background-color: #10b981; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  --input-focus: #2d8cf0;
  --font-color: #323232;
  --bg-color: #fff;
  --main-color: #323232;

  .main-switch-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .toggle { display: none; }

  /* Switch UI */
  .switch-ui {
    position: relative;
    width: 240px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-side::before {
    position: absolute;
    content: 'Log in';
    left: 0;
    top: 12px;
    width: 100px;
    text-align: center;
    text-decoration: underline;
    font-weight: 600;
    transition: 0.3s;
    font-size: 1.1rem;
  }

  .card-side::after {
    position: absolute;
    content: 'Sign up';
    right: 0;
    top: 12px;
    width: 100px;
    text-align: center;
    text-decoration: none;
    font-weight: 600;
    transition: 0.3s;
    font-size: 1.1rem;
  }

  .slider {
    position: absolute;
    width: 60px;
    height: 30px;
    background-color: #ddd;
    border-radius: 20px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    cursor: pointer;
    transition: 0.3s;
    z-index: 2;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    background-color: white;
    border: 2px solid var(--main-color);
    border-radius: 50%;
    left: 3px;
    bottom: 3px;
    transition: 0.3s;
  }

  .toggle:checked ~ .switch-ui .slider { background-color: var(--input-focus); }
  .toggle:checked ~ .switch-ui .slider:before { transform: translateX(30px); }
  .toggle:checked ~ .switch-ui .card-side:before { text-decoration: none; }
  .toggle:checked ~ .switch-ui .card-side:after { text-decoration: underline; }

  /* --- CARD SIZE INCREASED FOR LABELS --- */
  .flip-card__inner {
    width: 400px;
    height: 580px; /* Increased height to fit labels */
    position: relative;
    perspective: 1000px;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .toggle:checked ~ .flip-card__inner { transform: rotateY(180deg); }

  .flip-card__front, .flip-card__back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background: white;
    border-radius: 25px;
    border: 3px solid var(--main-color);
    box-shadow: 10px 10px var(--main-color);
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .flip-card__back { transform: rotateY(180deg); }

  .title {
    font-size: 32px;
    font-weight: 900;
    text-align: center;
    color: var(--main-color);
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  .flip-card__form {
    display: flex;
    flex-direction: column;
    gap: 15px; /* Reduced gap slightly since we have labels */
    width: 100%;
  }

  /* --- NEW: INPUT GROUP FOR LABELS --- */
  .input-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 5px;
    text-align: left;
  }

  .input-label {
    color: #333;
    font-weight: 700;
    font-size: 16px;
    margin-left: 2px;
  }

  .flip-card__input {
    width: 100%;
    height: 50px;
    border-radius: 10px;
    border: 2px solid var(--main-color);
    background-color: #fff;
    box-shadow: 4px 4px var(--main-color);
    font-size: 16px;
    padding: 0 16px;
    outline: none;
    transition: 0.2s;
    color: #333;
  }

  .flip-card__input:focus {
    border-color: var(--input-focus);
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px var(--main-color);
  }

  .flip-card__btn {
    margin-top: 10px;
    width: 100%;
    height: 55px;
    border-radius: 10px;
    border: 2px solid var(--main-color);
    background-color: var(--main-color);
    color: white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 4px 4px rgba(0,0,0,0.2);
    transition: 0.2s;
  }

  .flip-card__btn:active {
    box-shadow: 0 0;
    transform: translate(4px, 4px);
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 5px;
  }
  .checkbox-label {
    font-weight: 600;
    color: var(--main-color);
    font-size: 16px;
  }
  .custom-checkbox {
    width: 22px;
    height: 22px;
    accent-color: var(--main-color);
    cursor: pointer;
  }
`;

export default AuthPage;