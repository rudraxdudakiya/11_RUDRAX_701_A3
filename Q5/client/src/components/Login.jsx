import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginId.trim() || !password.trim()) {
      setError('Please enter your Employee ID / Email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      // Store JWT token and employee details in localStorage
      localStorage.setItem('employee_jwt_token', data.token);
      localStorage.setItem('employee_info', JSON.stringify(data.employee));

      onLoginSuccess(data.token, data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Employee Login</h2>
        <p className="subtitle">Sign in using your ERP credentials (JWT Authentication)</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="loginId">
              Employee ID or Email
            </label>
            <input
              id="loginId"
              type="text"
              className="form-control"
              placeholder="e.g. EMP1001 or employee@company.com"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter generated password from Q4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '5px' }}
          >
            {loading ? 'Authenticating with JWT...' : 'Login to Employee Portal'}
          </button>
        </form>

        <div className="login-note">
          <strong>Login Credentials:</strong><br />
          • <strong>Admin:</strong> <code>admin</code> / <code>admin123</code> (views all employee leaves & toggles/approves grant)<br />
          • <strong>Employee:</strong> <code>EMP1001</code> / generated password from Q4 dashboard
        </div>
      </div>
    </div>
  );
}
