import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory, FaPaw, FaCheckCircle, FaTimesCircle, FaClock, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/axios';

const STATUS_MAP = {
    Approved: { label: 'Approved', icon: <FaCheckCircle className="inline mr-1" />, cls: 'bg-green-100 text-green-700 border-green-200' },
    Adopted: { label: 'Adopted', icon: <FaHeart className="inline mr-1" />, cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    Rejected: { label: 'Rejected', icon: <FaTimesCircle className="inline mr-1" />, cls: 'bg-red-100 text-red-700 border-red-200' },
    Pending: { label: 'Pending', icon: <FaClock className="inline mr-1" />, cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
};

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdoptionHistory() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/adoptions/my');
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load adoption history');
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaPaw className="animate-bounce mb-3" size={32} />
            <p>Loading your adoption history…</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8D6E63] rounded-xl flex items-center justify-center text-white">
                    <FaHistory />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#5D4037]">Adoption History</h2>
                    <p className="text-sm text-gray-500">{requests.length} total request{requests.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['All', 'Pending', 'Approved', 'Adopted', 'Rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === f ? 'bg-[#8D6E63] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total', count: requests.length, color: 'bg-gray-50 border-gray-200' },
                    { label: 'Pending', count: requests.filter(r => r.status === 'Pending').length, color: 'bg-yellow-50 border-yellow-200' },
                    { label: 'Approved', count: requests.filter(r => ['Approved', 'Adopted'].includes(r.status)).length, color: 'bg-green-50 border-green-200' },
                    { label: 'Rejected', count: requests.filter(r => r.status === 'Rejected').length, color: 'bg-red-50 border-red-200' },
                ].map(s => (
                    <div key={s.label} className={`${s.color} border rounded-xl p-3 text-center`}>
                        <p className="text-2xl font-bold text-[#5D4037]">{s.count}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <FaPaw size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-500 mb-2">
                        {filter === 'All' ? "No adoption requests yet" : `No ${filter} requests`}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        {filter === 'All' ? "Start your journey by finding a companion!" : "Try a different filter"}
                    </p>
                    {filter === 'All' && (
                        <Link to="/pet-find" className="inline-flex items-center gap-2 bg-[#8D6E63] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#5D4037] transition-colors">
                            <FaPaw /> Find a Pet
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(req => {
                        const statusCfg = STATUS_MAP[req.status] || STATUS_MAP.Pending;
                        const pet = req.petId || {};
                        const petImg = pet.image || pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300';
                        const petName = pet.name || req.petName || 'Unknown Pet';
                        return (
                            <div key={req._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex overflow-hidden">
                                {/* Pet image */}
                                <div className="w-28 sm:w-36 flex-shrink-0">
                                    <img src={petImg} alt={petName} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <div>
                                            <h3 className="font-bold text-[#3E2723] text-base">{petName}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Applied: {formatDate(req.createdAt)}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusCfg.cls}`}>
                                            {statusCfg.icon}{statusCfg.label}
                                        </span>
                                    </div>

                                    {req.message && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 italic">"{req.message}"</p>
                                    )}

                                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                                        {pet._id && (
                                            <Link
                                                to={`/pet/${pet._id}`}
                                                className="text-xs text-[#8D6E63] font-semibold hover:underline"
                                            >
                                                View Pet →
                                            </Link>
                                        )}
                                        {req.status === 'Approved' && (
                                            <span className="text-xs text-green-600 font-semibold">
                                                🎉 Congratulations on your approval!
                                            </span>
                                        )}
                                        {req.status === 'Rejected' && req.rejectReason && (
                                            <span className="text-xs text-red-500">
                                                Reason: {req.rejectReason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
