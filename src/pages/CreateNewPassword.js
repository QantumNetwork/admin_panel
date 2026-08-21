import React, { useState } from 'react';
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import '../styles/create-new-password.css';

function CreateNewPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const email = localStorage.getItem('email') || '';

  const passwordRules = {
    length: password.length >= 8,
    number: /\d/.test(password),
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.number &&
    passwordRules.upperLower &&
    passwordRules.special;

  const canUpdatePassword = isPasswordValid && passwordsMatch;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${baseUrl}/admin/setNewPassword`, {
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message);

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.log('Error updating password:', err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/password-verification');
  };

  return (
    <div className="cnp-container">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        style={{
          zIndex: 9999,
          marginTop: '90px',
          fontSize: '14px',
          minWidth: '300px',
          textAlign: 'center',
        }}
      />
      {/* Logo */}
      <img src="/s2w-logo.png" alt="S2W Logo" className="cnp-logo" />

      {/* Card */}
      <div className="cnp-card">
        {/* Title */}
        <h2 className="cnp-title">Create a new password</h2>

        <form onSubmit={handleUpdatePassword}>
          {/* New Password */}
          <div className="cnp-password-section">
            <label className="cnp-input-label">New password</label>

            <div className="cnp-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cnp-password-input"
              />

              <button
                type="button"
                className="cnp-eye-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            </div>

            {/* Password strength bars */}
            <div className="cnp-password-bars">
              <span
                className={
                  passwordRules.length
                    ? 'cnp-password-bar cnp-valid'
                    : 'cnp-password-bar'
                }
              />

              <span
                className={
                  passwordRules.number
                    ? 'cnp-password-bar cnp-valid'
                    : 'cnp-password-bar'
                }
              />

              <span
                className={
                  passwordRules.upperLower
                    ? 'cnp-password-bar cnp-valid'
                    : 'cnp-password-bar'
                }
              />

              <span
                className={
                  passwordRules.special
                    ? 'cnp-password-bar cnp-valid'
                    : 'cnp-password-bar'
                }
              />

              <span
                className={
                  password.length > 0
                    ? 'cnp-password-bar cnp-valid'
                    : 'cnp-password-bar'
                }
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="cnp-requirements">
            <p className="cnp-requirements-heading">
              Your password must include:
            </p>

            <div className="cnp-requirement-row">
              <span>At least 8 characters</span>
              {passwordRules.length && (
                <IoCheckmarkCircle className="cnp-requirement-check" />
              )}
            </div>

            <div className="cnp-requirement-row">
              <span>At least 1 number</span>
              {passwordRules.number && (
                <IoCheckmarkCircle className="cnp-requirement-check" />
              )}
            </div>

            <div className="cnp-requirement-row">
              <span>Upper and lowercase letters</span>
              {passwordRules.upperLower && (
                <IoCheckmarkCircle className="cnp-requirement-check" />
              )}
            </div>

            <div className="cnp-requirement-row">
              <span>At least one special character</span>
              {passwordRules.special && (
                <IoCheckmarkCircle className="cnp-requirement-check" />
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="cnp-confirm-section">
            <label className="cnp-input-label">Confirm password</label>

            <div className="cnp-password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="cnp-password-input"
              />

              <button
                type="button"
                className="cnp-eye-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            </div>

            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="cnp-password-error">Passwords do not match</p>
            )}
          </div>

          {/* Buttons */}
          <div className="cnp-button-container">
            <button
              type="button"
              className="cnp-cancel-button"
              onClick={handleCancel}
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="cnp-update-button"
              disabled={!canUpdatePassword}
            >
              UPDATE PASSWORD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateNewPassword;
