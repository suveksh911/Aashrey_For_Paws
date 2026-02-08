import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import PetFind from './pages/PetFind';
import PetDetails from './pages/PetDetails';
import LostFound from './pages/LostFound';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import NGODashboard from './pages/NGODashboard';
import AddPet from './pages/AddPet';
import UserDashboard from './pages/UserDashboard';
import AdoptionRequest from './pages/AdoptionRequest';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import EditPet from './pages/EditPet';
import { AuthProvider } from './context/AuthContext';
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
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/pet-find" element={<PetFind />} />
            <Route path="/pet/:id" element={<PetDetails />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/community" element={<Community />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/unauthorized" element={<Unauthorized />} />


            { }
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['NGO']} />}>
              <Route path="/ngo" element={<NGODashboard />} />
              <Route path="/add-pet" element={<AddPet />} />
              <Route path="/edit-pet/:id" element={<EditPet />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Adopter', 'Owner']} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/adopt/:id" element={<AdoptionRequest />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
