import React from 'react';

export default function Home({ employee, setActiveTab, onLogout }) {
  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2>Welcome, {employee?.name || 'Employee'}</h2>
        <p>
          Employee Self-Service Portal (Referencing Q4 ERP with JWT Authentication).
        </p>
      </div>

      <div className="section-title">
        Portal Navigation Links (Assignment 3 - Question 5)
      </div>

      <div className="grid-cards">
        {/* Link to Page 1: Employee Profile */}
        <div className="action-card">
          <div>
            <h3>Page 1: Employee Profile</h3>
            <p>
              View your complete professional profile, employee ID, department, designation, and salary
              structure including Basic, HRA, DA, Deductions, and Net Salary.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('profile')}>
            Open Employee Profile
          </button>
        </div>

        {/* Link to Page 2: Application for Leave */}
        <div className="action-card">
          <div>
            <h3>Page 2: Application for Leave</h3>
            <p>
              Apply for upcoming leave by specifying the date and reason. View the list of all your leave
              applications with real-time Grant status (Yes / No).
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('leave')}>
            Manage Leave Applications
          </button>
        </div>
      </div>

      {/* Session Details Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Current Authenticated Session (JWT)</h3>
        <table className="info-table">
          <tbody>
            <tr>
              <td><strong>Authentication Protocol:</strong></td>
              <td>JSON Web Token (JWT Bearer Authorization)</td>
            </tr>
            <tr>
              <td><strong>Employee ID:</strong></td>
              <td><code>{employee?.empid}</code></td>
            </tr>
            <tr>
              <td><strong>Department & Role:</strong></td>
              <td>
                {employee?.department || 'General'} — {employee?.designation || 'Associate'}
              </td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>{employee?.email}</td>
            </tr>
            <tr>
              <td><strong>Session Action:</strong></td>
              <td>
                <button className="btn btn-danger" onClick={onLogout}>
                  Logout of Session
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
