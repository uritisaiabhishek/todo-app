// src/components/LoginPopup.jsx
import React, { useState } from 'react';

const LoginPopup = ({ onLogin, onSignUp }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      return 'Weak';
    }
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[@$!%*?&#]/)) {
      return 'Strong';
    }
    return 'Moderate';
  };

  const handleLoginClick = () => {
    const validationErrors = {};
    if (!email) {
      validationErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      validationErrors.email = 'Invalid email address.';
    }
    if (!password) {
      validationErrors.password = 'Password is required.';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onLogin(email, password);
    }
  };

  const handleSignUpClick = () => {
    const validationErrors = {};
    if (!email) {
      validationErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      validationErrors.email = 'Invalid email address.';
    }
    if (!password) {
      validationErrors.password = 'Password is required.';
    } else {
      const strength = checkPasswordStrength(password);
      if (strength === 'Weak') {
        validationErrors.password = 'Password is too weak.';
      }
    }
    if (!confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSignUp(email, password);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const strength = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const renderForm = () => (
    <>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <p className="error-message">{errors.email}</p>}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
      />
      {errors.password && <p className="error-message">{errors.password}</p>}
      {activeTab === 'signup' && (
        <>
          <small className={`password-strength ${passwordStrength.toLowerCase()}`}>
            Password strength: {passwordStrength}
          </small>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </>
      )}
    </>
  );

  return (
    <div className="login-popup">
      <div className="tab-header">
        <button
          className={activeTab === 'login' ? 'active' : ''}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          className={activeTab === 'signup' ? 'active' : ''}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>

      <h2>{activeTab === 'login' ? 'Login' : 'Sign Up'}</h2>
      {renderForm()}
      <button onClick={activeTab === 'login' ? handleLoginClick : handleSignUpClick}>
        {activeTab === 'login' ? 'Login' : 'Sign Up'}
      </button>
    </div>
  );
};

export default LoginPopup;
