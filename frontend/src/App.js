import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react';

// Pages
import CreateForm from './components/CreateForm';
import AllItems from './components/AllItems';
import UpdateForm from './components/UpdateForm';
import Home from './components/Home';
import Payment from './Chethmi/Client/Payment';
import OrderForm from './components/order/OrderForm';
import AllOrders from './components/order/AllOrders';
import DownloadInvoice from './components/DownloadInvoice';
import Register from './auth/Register';
import Login from './auth/Login';

// Shared Components
import Layout from './components/shared/Layout';
import Spinner from './components/shared/Spinner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <Spinner fullPage text="Loading application..." />;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    
    return (
      <Layout setIsAuthenticated={setIsAuthenticated}>
        {children}
      </Layout>
    );
  };

  // Public route component (only accessible when not authenticated)
  const PublicRoute = ({ children }) => {
    if (isLoading) {
      return <Spinner fullPage text="Loading application..." />;
    }

    if (isAuthenticated) {
      return <Navigate to="/home" />;
    }
    
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (accessible only when not logged in) */}
        <Route path="/" element={
          <PublicRoute>
            <Login setIsAuthenticated={setIsAuthenticated} />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes (require authentication) */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/createform" element={
          <ProtectedRoute>
            <CreateForm />
          </ProtectedRoute>
        } />
        <Route path="/updateform/:id" element={
          <ProtectedRoute>
            <UpdateForm />
          </ProtectedRoute>
        } />
        <Route path="/allItems" element={
          <ProtectedRoute>
            <AllItems />
          </ProtectedRoute>
        } />
        <Route path="/payment/:id" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/downloadInvoice" element={
          <ProtectedRoute>
            <DownloadInvoice />
          </ProtectedRoute>
        } />
        <Route path="/ordercreate" element={
          <ProtectedRoute>
            <OrderForm />
          </ProtectedRoute>
        } />
        <Route path="/allorders" element={
          <ProtectedRoute>
            <AllOrders />
          </ProtectedRoute>
        } />

        {/* Catch-all route - redirect to home if authenticated, login if not */}
        <Route path="*" element={
          isAuthenticated ? 
            <Navigate to="/home" replace /> : 
            <Navigate to="/" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
