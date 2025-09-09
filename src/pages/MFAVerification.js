import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosContact } from "react-icons/io";
import axios from 'axios';
import "../styles/mfa-verification.css"; // External CSS file

function MFAVerification() {

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [access, setAccess] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email =
    location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${baseUrl}/admin/google-verify/${email}`, {
        otp
      });

      if(response.data.success) {
        if(response.data.data.token) {
            console.log(response.data);
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userType", response.data.data.type); //can be user/admin/power admin
            localStorage.setItem("appGroup", response.data.data.appType);
            const userAccess = response.data.data.access || [];

            localStorage.setItem("access", userAccess);
            if(response.data.data.type === 'power') {
              navigate('/power-admin');
            } else {
              navigate('/dashboard', { state: { email } });
            }
            
        }
      }

    } catch(err) {
      console.log('Error verifying OTP: ',err);
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="container">
      {/* Logo */}
      <img src="/s2w-logo.png" alt="S2W Logo" className="logo" />

      {/* Card */}
      <div className="card">
        {/* Circular Background with Lock Icon */}
        <div className="lock-container">
          <img src="/authenticator-icon.png" alt="Google Authenticator Icon" className="authenticator-image" />
        </div>


        {/* Title */}
        <h2 className="title">Verify with your Google Authenticator</h2>

        {/* User Email */}
        <p className="email">
          <span className="email-icon"><IoIosContact/></span>{email}
        </p>

        {/* Instruction Text */}
        <p className="instruction">
          Enter the temporary code generated in your Google Authenticator app
        </p>

        {/* Input Field */}
        <form onSubmit={handleSubmit}>
          <label className="input-label">Enter code</label>
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="otp-input"
            />
          </div>
          {error && <p className="error-text">{error}</p>}

          {/* Verify Button */}
          <button type="submit" className="verify-button">
            VERIFY
          </button>
        </form>

        {/* Back to Sign In */}
        <a href='/'><p className="back-link">Back to sign in</p></a>
      </div>
    </div>
  );
}

export default MFAVerification;
