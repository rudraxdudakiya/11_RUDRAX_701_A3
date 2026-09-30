import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import LeaveApplication from './components/LeaveApplication';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('employee_jwt_token') || null);
  const [employee, setEmployee] = useState(() => {
    const saved = localStorage.getItem('employee_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'profile' | 'leave'

  const handleLoginSuccess = (newToken, employeeData) => {
    setToken(newToken);
    setEmployee(employeeData);
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_jwt_token');
    localStorage.removeItem('employee_info');
    setToken(null);
    setEmployee(null);
    setActiveTab('home');
  };

  // If not authenticated with JWT, show Login
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        employee={employee}
        onLogout={handleLogout}
      />

      {/* Main Content Dynamic Pages */}
      <main className="main-content">
        {activeTab === 'home' && (
          <Home
            employee={employee}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            token={token}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveApplication
            token={token}
            employee={employee}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
}
