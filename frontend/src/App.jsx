import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from "./components/common/Navbar.jsx";
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import PetFind from './pages/PetFind';
import PetDetails from './pages/PetDetails';
import LostFound from './pages/LostFound';
import Campaigns from './pages/Campaigns';
import Community from './pages/Community';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import NGODashboard from './pages/NGODashboard';
import NGODetails from './pages/NGODetails';
import AddPet from './pages/AddPet';
import UserDashboard from './pages/UserDashboard';
import AdoptionRequest from './pages/AdoptionRequest';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import KhaltiPaymentCallbackPage from './pages/KhaltiPaymentCallbackPage';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/common/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import EditPet from './pages/EditPet';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdoptionStatus from './pages/AdoptionStatus';
import AdoptionHistory from './pages/AdoptionHistory';
import NGODocumentUpload from './pages/NGODocumentUpload';
import VerificationStatus from './pages/VerificationStatus';
import NotFound from './pages/NotFound';
import PetPurchase from './pages/PetPurchase';
import NGOShelterMap from './pages/NGOShelterMap';
import RoleProfiles from './pages/RoleProfiles';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/common/Footer';
import api from './services/axios';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="app-wrapper">
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/pet-find" element={<PetFind />} />
            <Route path="/pet/:id" element={<PetDetails />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/community" element={<Community />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />
            <Route path="/khalti-callback" element={<KhaltiPaymentCallbackPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/ngo/:id" element={<NGODetails />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/ngo-document-upload" element={<NGODocumentUpload />} />
            <Route path="/verification-status" element={<VerificationStatus />} />
            <Route path="/shelter-map" element={<NGOShelterMap />} />
            <Route path="/role-profile" element={<RoleProfiles />} />

            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['NGO', 'Owner']} />}>
              <Route path="/add-pet" element={<AddPet />} />
              <Route path="/edit-pet/:id" element={<EditPet />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['NGO']} />}>
              <Route path="/ngo" element={<NGODashboard />} />
            </Route>
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['User', 'Adopter', 'Owner']} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/adopt/:id" element={<AdoptionRequest />} />
              <Route path="/adoption-status" element={<AdoptionStatus />} />
              <Route path="/adoption-history" element={<AdoptionHistory />} />
              <Route path="/pet/buy/:id" element={<PetPurchase />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
