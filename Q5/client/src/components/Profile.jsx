import React, { useState, useEffect } from 'react';

export default function Profile({ token, setActiveTab }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/employee/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch employee profile');
      }

      setProfile(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
        <p className="subtitle">Loading Employee Profile from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchProfile}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Page 1: Employee Profile</h2>
          <p className="subtitle">Personal information, organization role, and dynamic salary breakdown</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveTab('home')}
        >
          Back to Home
        </button>
      </div>

      <div className="grid-cards">
        {/* General & Organizational Details */}
        <div className="card">
          <h3>Employee Information</h3>
          <table className="info-table">
            <tbody>
              <tr>
                <td><strong>Employee ID:</strong></td>
                <td><code>{profile?.empid}</code></td>
              </tr>
              <tr>
                <td><strong>Full Name:</strong></td>
                <td>{profile?.name}</td>
              </tr>
              <tr>
                <td><strong>Official Email:</strong></td>
                <td>{profile?.email}</td>
              </tr>
              <tr>
                <td><strong>Department:</strong></td>
                <td>{profile?.department}</td>
              </tr>
              <tr>
                <td><strong>Designation:</strong></td>
                <td>{profile?.designation}</td>
              </tr>
              <tr>
                <td><strong>Member Since:</strong></td>
                <td>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Salary Details Card (from Q4 calculation) */}
        <div className="card">
          <h3>Salary Structure Breakdown</h3>
          <table className="info-table">
            <tbody>
              <tr>
                <td><strong>Basic Salary:</strong></td>
                <td>₹{profile?.basicSalary?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td><strong>HRA (20%):</strong></td>
                <td style={{ color: '#28a745' }}>+ ₹{profile?.hra?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td><strong>DA (10%):</strong></td>
                <td style={{ color: '#28a745' }}>+ ₹{profile?.da?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td><strong>Deductions (5%):</strong></td>
                <td style={{ color: '#dc3545' }}>- ₹{profile?.deductions?.toLocaleString() || 0}</td>
              </tr>
              <tr className="highlight-row">
                <td><strong>Monthly Net In-Hand Salary:</strong></td>
                <td><strong>₹{profile?.netSalary?.toLocaleString() || 0}</strong></td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
            * Calculated dynamically via Q4 Mongoose Pre-save Hook (Basic + HRA + DA - Deductions).
          </p>
        </div>
      </div>
    </div>
  );
}
