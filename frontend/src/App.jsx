import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import AdminLogin from './pages/AdminLogin';
import ConsumerDashboard from './pages/ConsumerDashboard';
import IntegrationTestBed from './pages/IntegrationTestBed';
import ActualIntegration from './pages/ActualIntegration';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login/user" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/login/admin" element={<AdminLogin />} />
                <Route path="/dashboard/consumer" element={<ConsumerDashboard />} />
                <Route path="/dashboard/integration-test" element={<IntegrationTestBed />} />
                <Route path="/dashboard/actual-integration" element={<ActualIntegration />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
