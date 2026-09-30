import React from 'react';

export default function Navbar({ activeTab, setActiveTab, employee, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab('home')}>
          Employee Portal
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile (Page 1)
          </button>
          <button
            className={`nav-btn ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
          >
            Leave Application (Page 2)
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="nav-user">
          {employee && (
            <span className="user-info">
              {employee.name} ({employee.empid})
            </span>
          )}
          <button className="btn-logout" onClick={onLogout} title="Logout of session">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
