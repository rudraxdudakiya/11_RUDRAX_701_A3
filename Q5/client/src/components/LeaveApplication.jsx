import React, { useState, useEffect } from 'react';

export default function LeaveApplication({ token, employee, setActiveTab }) {
  const [leaves, setLeaves] = useState([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const isAdmin = employee?.role === 'admin';

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leave/my-leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLeaves(data.leaves);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add / Apply for Leave (Used by employees)
  const handleApply = async (e) => {
    e.preventDefault();
    if (!date || !reason.trim()) {
      setStatusMessage({ type: 'danger', text: 'Please fill in both the leave date and reason.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/leave/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date, reason, grant: 'No' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit leave application.');
      }

      setStatusMessage({ type: 'success', text: 'Leave application submitted successfully! Waiting for Admin grant.' });
      setDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Grant Status between Yes and No (Only Admin)
  const handleToggle = async (leaveId, currentGrant) => {
    try {
      const nextGrant = currentGrant === 'Yes' ? 'No' : 'Yes';
      const response = await fetch(`/api/leave/${leaveId}/grant`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ grantStatus: nextGrant })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setLeaves((prev) =>
          prev.map((l) => (l._id === leaveId ? { ...l, grant: data.leave.grant } : l))
        );
      }
    } catch (err) {
      console.error('Failed to toggle grant:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Page 2: Application for Leave {isAdmin ? '(Admin Review)' : ''}</h2>
          <p className="subtitle">
            {isAdmin
              ? 'Admin Panel: View all employee leave applications and decide Grant (Yes / No)'
              : 'Submit your leave request and view approval status'}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveTab('home')}
        >
          Back to Home
        </button>
      </div>

      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Form to Apply for Leave (Only shown for Employees) */}
      {!isAdmin && (
        <div className="card">
          <h3>Application for Leave (Add)</h3>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label" htmlFor="leaveDate">
                Date:
              </label>
              <input
                id="leaveDate"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="leaveReason">
                Reason:
              </label>
              <textarea
                id="leaveReason"
                className="form-control"
                rows="3"
                placeholder="Enter reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </form>
        </div>
      )}

      {/* List Leaves Section */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>
          {isAdmin ? 'All Employee Leave Applications (Admin Decision)' : 'My Leave Applications (List)'}
        </h3>

        {loading ? (
          <p style={{ color: '#666', padding: '15px 0' }}>Loading leave applications...</p>
        ) : leaves.length === 0 ? (
          <p style={{ color: '#666', padding: '15px 0' }}>
            {isAdmin ? 'No leave applications submitted by any employee yet.' : 'No leave applications submitted yet.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {isAdmin && <th>Emp ID</th>}
                  {isAdmin && <th>Employee Name</th>}
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Grant (Yes / No)</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    {isAdmin && <td><strong>{item.empid}</strong></td>}
                    {isAdmin && <td>{item.employeeName}</td>}
                    <td>{item.date}</td>
                    <td>{item.reason}</td>
                    <td>{item.grant}</td>
                    {isAdmin && (
                      <td>
                        <button onClick={() => handleToggle(item._id, item.grant)}>
                          Toggle
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isAdmin && (
          <p style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
            * Note: Only Admin (credentials: <code>admin</code> / <code>admin123</code>) can decide to approve or reject (toggle) leave applications.
          </p>
        )}
      </div>
    </div>
  );
}
