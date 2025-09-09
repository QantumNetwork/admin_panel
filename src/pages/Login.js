import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import validator from "validator";
import Select, { components } from "react-select";
import countryList from "react-select-country-list";
import "../styles/login.css";

// Custom SingleValue to display only the flag and two-letter code
const CustomSingleValue = (props) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <img
        src={`https://flagcdn.com/w40/${data.value.toLowerCase()}.png`}
        alt={data.value}
        className="country-flag"
      />
      <span className="country-code">{data.value}</span>
    </components.SingleValue>
  );
};

function Login() {
  let [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  // Default country is US (both label and value are "US")
  const [country, setCountry] = useState({ label: "US", value: "US" });
  const navigate = useNavigate();

  const countryOptions = countryList().getData(); // Get country list

  const handleChange = (selectedOption) => {
    setCountry(selectedOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    try {
      const response = await axios.post(
        `${baseUrl}/admin/username-verify`,
        { email }
      );

      if (response.data.success) {
        navigate("/password-verification", { state: { email } });
      } else {
        navigate("/signup", { state: { email } });
      }
    } catch (err) {
      console.error("Error verifying email:", err);
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <img src="/s2w-logo.png" alt="Company Logo" className="login-logo" />

      <div className="login-box">
        {/* Country Selector positioned in the top-right corner */}
        {/* <div className="country-selector">
          <Select
            options={countryOptions}
            value={country}
            onChange={handleChange}
            isSearchable={false}
            components={{ SingleValue: CustomSingleValue }}
            styles={{
              control: (base) => ({
                ...base,
                border: "none",
                boxShadow: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                minHeight: "auto",
                height: "auto",
                paddingRight: 0, // remove extra right padding from control
              }),
              indicatorSeparator: () => null,
              // Remove extra spacing in the indicators container
              indicatorsContainer: (base) => ({
                ...base,
                padding: 0,
                margin: 0,
              }),
              // Tighten the gap for the dropdown arrow
              dropdownIndicator: (base) => ({
                ...base,
                color: "black",
                fontWeight: "bold",
                padding: "0", // remove padding around the arrow
                marginLeft: "2px", // minimal margin from country code
              }),
              valueContainer: (base) => ({
                ...base,
                paddingRight: 0,
                justifyContent: "flex-end", // align flag & code to right
              }),
              singleValue: (base) => ({
                ...base,
                fontWeight: "bold",
                color: "black",
                display: "flex",
                alignItems: "center",
                gap: "2px", // gap between flag and country code remains minimal
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            className="country-dropdown"
          />
        </div> */}

        <h2 className="login-header">Log in to your account</h2>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            type="text"
            id="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="button">
            Continue
          </button>
        </form>
        <p className="signup-text">
          Don't have an account? <a href="#">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
