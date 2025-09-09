import React, { useState } from 'react';
import { FaEyeSlash, FaEye, FaStar } from 'react-icons/fa';
import { MdLockOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { IoIosContact } from "react-icons/io";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/password-verification.css';

const PasswordVerification = () => {

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const togglePasswordVisibility = () => {
    setPasswordVisible(prevState => !prevState); // Ensures state updates correctly
  };

  //handleVerify function
  
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${baseUrl}/admin/password-verify`, {
        email: email,
        password: password
      });

      if(response.data.data.qrCode) {
        const qrCode = response.data.data.qrCode;
        navigate('/setup-mfa', {state: {email, qrCode}});
      } else {
        navigate('/verify-mfa', {state: {email}});
      }
    } catch(err) {
      console.log("Error during password verification:", err);
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="password-verification-container">
      {/* S2W Logo at the top */}
      <div className="logo-container">
        <img src="./s2w-logo.png" alt="S2W Logo" className="s2w-logo" />
      </div>
      
      {/* Verification Card */}
      <div className="password-verification-box">
        {/* Blue badge embedded inside the card */}
        <div className="blue-lock-section">
          <div className="blue-circle">
            <MdLockOutline size={24} color="#fff" className="lock-icon" />
            <div className="stars-container">
              <FaStar size={10} color="#fff" />
              <FaStar size={10} color="#fff" />
              <FaStar size={10} color="#fff" />
              <FaStar size={10} color="#fff" />
            </div>
          </div>
        </div>
        
        <h2 className="verification-header">Verify with your password</h2>
        <div className="verification-email">
          <IoIosContact className="email-icon" />
          <span className="email-text">{email}</span>
        </div>

        <label className="pw-label">Password</label>
        <div className="input-wrapper-pv">
  <input
    type={passwordVisible ? "text" : "password"}  // Correctly toggles between "text" and "password"
    className="password-input"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="new-password" // Prevents autofill issues
  />
  <span className="eye-icon" onClick={togglePasswordVisibility}>
    {passwordVisible ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
  </span>
</div>

{error && <p className="error-text">{error}</p>}

        <button className="verify-button" onClick={handleVerify}>VERIFY</button>

        <div className="bottom-links">
          <a href="#">Forgot password?</a>
          <a href="#">Verify with something else</a>
          <a href="/">Back to sign in</a>
        </div>
      </div>
    </div>
  );
};

export default PasswordVerification;