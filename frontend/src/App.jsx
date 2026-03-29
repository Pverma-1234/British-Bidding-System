import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateRFQ from './pages/CreateRFQ';
import EditRFQ from './pages/EditRFQ';
import RFQDetails from './pages/RFQDetails';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Toaster } from 'react-hot-toast';
import 'nprogress/nprogress.css';
import TopLoader from './components/TopLoader';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
          <TopLoader />
          <Toaster position="top-center" toastOptions={{ duration: 4000, style: { fontSize: '14px', borderRadius: '8px' } }} />
          <Navbar />
          <main className="pb-20">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <CreateRFQ />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit/:id" 
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <EditRFQ />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rfq/:id" 
                element={
                  <ProtectedRoute>
                    <RFQDetails />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
