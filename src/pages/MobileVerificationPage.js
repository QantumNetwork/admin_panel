import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { IoIosContact } from 'react-icons/io';
import axios from 'axios';
import '../styles/mobile-verification-page.css'; // External CSS file

function MobileVerificationPage() {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [searchParams] = useSearchParams();
  const isForgotPassword = searchParams.get('from') === 'forgot-password';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [access, setAccess] = useState([]);
  const navigate = useNavigate();
  const email = localStorage.getItem('email') || '';

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');

    if (!value) return;

    const otpArray = otp.split('');

    otpArray[index] = value[value.length - 1];

    const newOtp = otpArray.join('').slice(0, 4);

    setOtp(newOtp);

    // Move focus to next box
    if (index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);

      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const otpArray = otp.split('');

      if (otpArray[index]) {
        otpArray[index] = '';
        setOtp(otpArray.join(''));
      } else if (index > 0) {
        const previousInput = document.getElementById(`otp-${index - 1}`);

        if (previousInput) {
          previousInput.focus();
        }
      }
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await axios.post(`${baseUrl}/admin/verifyOtp`, {
      email,
      otp,
    });

    if (response.data.success) {
      navigate('/create-new-password');
    } else {
      setError(response.data.message || 'OTP verification failed.');
    }
  } catch (err) {
    console.log('Error verifying mobile OTP:', err);

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';

    setError(errorMessage);
  }
};

  return (
    <div className="mvp-container">
      {/* Logo */}
      <img src="/s2w-logo.png" alt="S2W Logo" className="mvp-logo" />

      {/* Card */}
      <div className="mvp-card">
        {/* Circular Background with Lock Icon */}
        <div className="mvp-icon-container">
          <img
            src="/mobile-verification.png"
            alt="Mobile Verification Icon"
            className="mvp-authenticator-image"
          />
        </div>

        {/* Title */}
        <h2 className="mvp-title">Verify your mobile</h2>

        {/* Instruction Text */}
        <p className="mvp-instruction">
          We have sent a 4 digit OTP to your registered mobile
        </p>

        {/* Input Field */}
        <form onSubmit={handleSubmit}>
          <label className="mvp-input-label">Enter code</label>
          {/* OTP Inputs */}
          <div className="mvp-otp-container">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={otp[index] || ''}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="mvp-otp-box"
              />
            ))}
          </div>
          {error && <p className="mvp-error-text">{error}</p>}

          {/* Verify Button */}
          <button type="submit" className="mvp-verify-button">
            VERIFY
          </button>
        </form>

        {/* Back to Sign In */}
        <a href="/" className="mvp-back-link">
          Back to sign in
        </a>
      </div>
    </div>
  );
}

export default MobileVerificationPage;
