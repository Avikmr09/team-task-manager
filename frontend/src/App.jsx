import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">TeamManager</h1>
          <div>
            {localStorage.getItem('userInfo') && (
              <button 
                onClick={() => { localStorage.removeItem('userInfo'); window.location.href='/login'; }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
