import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenuManagement from './pages/AdminMenuManagement';
import AdminOrderManagement from './pages/AdminOrderManagement';
import DisplayKiosk from './pages/DisplayKiosk';
import Receipt from './pages/Receipt';

// Components
import Navbar from './components/Navbar';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/display" element={<DisplayKiosk />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          } />
          
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
          
          <Route path="/my-orders" element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          } />
          
          <Route path="/orders/:id" element={
            <PrivateRoute>
              <OrderDetails />
            </PrivateRoute>
          } />
          
          <Route path="/receipt/:id" element={
            <PrivateRoute>
              <Receipt />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin', 'staff']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/menu" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminMenuManagement />
            </PrivateRoute>
          } />
          
          <Route path="/admin/orders" element={
            <PrivateRoute allowedRoles={['admin', 'staff']}>
              <AdminOrderManagement />
            </PrivateRoute>
          } />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
