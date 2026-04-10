import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFileUpload, FaPaw } from 'react-icons/fa';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';

const VerificationStatus = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ngo/verification-status');
            if (res.data.success) {
                setStatus(res.data.data?.verificationStatus || res.data.data?.status || 'Unverified');
                setRejectionReason(res.data.data?.rejectionReason || '');
            } else {
                // Fallback: use AuthContext user data
                setStatus(user?.verificationStatus || user?.isVerified ? 'Verified' : 'Unverified');
            }
        } catch {
            // Fallback: read from AuthContext
            setStatus(user?.verificationStatus || (user?.isVerified ? 'Verified' : 'Unverified'));
        } finally {
            setLoading(false);
        }
    };

    const renderStatus = () => {
        switch (status) {
            case 'Verified':
            case 'Approved':
                return (
                    <div className="text-center py-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheckCircle size={48} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Verified ✅</h2>
                        <p className="text-gray-500 mb-6">Congratulations! Your organization is verified. You now have the "Verified" badge on your profile.</p>
                        <Link to="/ngo" className="bg-[#8D6E63] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5D4037] transition-colors">
                            Go to Dashboard
                        </Link>
                    </div>
                );
            case 'Pending':
                return (
                    <div className="text-center py-6">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaHourglassHalf size={48} className="text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-600 mb-2">Under Review ⏳</h2>
                        <p className="text-gray-500 mb-2">Your documents have been submitted and are under review by our admin team.</p>
                        <p className="text-sm text-gray-400 mb-6">This usually takes <strong>24–48 hours</strong>. You'll be notified once reviewed.</p>
                        <Link to="/ngo" className="border border-[#8D6E63] text-[#8D6E63] px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors">
                            Back to Dashboard
                        </Link>
                    </div>
                );
            case 'Rejected':
                return (
                    <div className="text-center py-6">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTimesCircle size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed ❌</h2>
                        <p className="text-gray-500 mb-2">Your verification was rejected. Please review and re-upload valid documents.</p>
                        {rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4 text-left">
                                <strong>Reason:</strong> {rejectionReason}
                            </div>
                        )}
                        <Link to="/ngo-document-upload" className="bg-[#8D6E63] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5D4037] transition-colors">
                            Re-upload Documents
                        </Link>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaFileUpload size={48} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-600 mb-2">Not Verified Yet</h2>
                        <p className="text-gray-500 mb-6">Submit your NGO documents to get a verified badge and build trust with adopters.</p>
                        <Link to="/ngo-document-upload" className="bg-[#8D6E63] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5D4037] transition-colors">
                            Start Verification
                        </Link>
                    </div>
                );
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <FaPaw className="animate-bounce text-[#8D6E63]" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">
                {renderStatus()}
            </div>
        </div>
    );
};

export default VerificationStatus;
