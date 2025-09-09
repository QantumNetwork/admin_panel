//mfaSetup file
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaQrcode } from "react-icons/fa";
import "../styles/mfa-setup.css"; // Make sure this file is in your styles folder

function MFASetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const qrCode = location.state?.qrCode || "";

  return (
    <div className="container">
      {/* S2W Logo */}
      <img src="/s2w-logo.png" alt="S2W Logo" className="logo" />

      {/* Card */}
      <div className="card">
        {/* Circular Icon Container */}
        <div className="icon-container">
          <FaQrcode className="qr-icon" />
        </div>

        {/* Title */}
        <h2 className="title">Set up Two-Factor Authentication</h2>

        {/* Instruction Text */}
        <p className="instruction">
          Scan this QR code with Google Authenticator:
        </p>

        {/* QR Code Image */}
        <img 
        src={qrCode} 
        alt="MFA QR Code" 
        className="qr-code" 
        onError={(e) => console.error("Image failed to load", e)}
        />

        {/* Continue Button */}
        <button
          onClick={() =>
            navigate("/verify-mfa", { state: { email } })
          }
          className="continue-button"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default MFASetup;
