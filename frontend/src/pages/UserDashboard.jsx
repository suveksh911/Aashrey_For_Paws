import React from 'react';
import { useAuth } from '../context/AuthContext';
import OwnerDashboard from './OwnerDashboard';
import AdopterDashboard from './AdopterDashboard';

function UserDashboard() {
    const { user } = useAuth();
    
    // Default to Adopter if role is unknown or 'adopter'
    if (user?.role === 'Owner') {
        return <OwnerDashboard user={user} />;
    }
    
    return <AdopterDashboard user={user} />;
}

export default UserDashboard;
