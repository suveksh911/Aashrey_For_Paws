import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaStar, FaUserCircle, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import api from '../services/axios';
import { toast } from 'react-toastify';

// ────────────────────────────────────────────────
//  SECTION: User Messages Tab (NGO Style)
// ────────────────────────────────────────────────
export const UserMessagesTab = ({ messages: initialMessages, loading }) => {
    const [messages, setMessages] = useState(initialMessages || []);
    const [expanded, setExpanded] = useState(null);
    const [userReplyText, setUserReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        setMessages(initialMessages || []);
    }, [initialMessages]);

    const handleUserReply = async (id) => {
        if (!userReplyText.trim()) return toast.error('Please enter a message');
        if (isReplying) return;

        setIsReplying(true);
        try {
            const res = await api.patch(`/contact/${id}/user-reply`, { message: userReplyText });
            if (res.data.success) {
                toast.success('Reply sent successfully');
                setMessages(messages.map(m => m._id === id ? res.data.data : m));
                setUserReplyText('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reply');
        } finally {
            setIsReplying(false);
        }
    };

    if (loading) return <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>;

    if (messages.length === 0) return (
        <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#5D4037] hover:bg-orange-50 transition-all duration-300 group">
            <FaEnvelope className="mx-auto text-gray-300 mb-3 group-hover:scale-110 group-hover:rotate-3 group-hover:text-[#db2777] transition-transform duration-300" size={40} />
            <p className="text-gray-500 font-medium font-bold">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">Your inquiries to the Admin will appear here.</p>
        </div>
    );

    return (
        <div className="space-y-4 px-1">
            {messages.map(msg => (
                <div key={msg._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-[#5D4037]" onClick={() => setExpanded(expanded === msg._id ? null : msg._id)}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-black text-[#3E2723] text-lg">{msg.subject || 'General Inquiry'}</div>
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        </div>
                        {msg.isReplied && <span className="bg-[#1e293b] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">Replied</span>}
                    </div>
                    
                    {expanded === msg._id ? (
                        <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 font-medium">{msg.message}</div>
                            {msg.replies?.length > 0 && (
                                <div className="space-y-4 ml-2 border-l-2 border-[#1e293b]/10 pl-5 mb-6">
                                    {msg.replies.map((reply, i) => {
                                        const isAdmin = reply.senderRole === 'Admin';
                                        return (
                                            <div key={i} className="mb-4">
                                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-60 ${isAdmin ? 'text-[#1e293b]' : 'text-[#5D4037]'}`}>
                                                    {isAdmin ? 'Admin Support Response' : 'My Follow-up'}
                                                </div>
                                                <div className={`p-4 rounded-2xl relative shadow-sm border ${
                                                    isAdmin 
                                                        ? 'bg-[#f8fafc] border-[#e2e8f0] before:content-[\'\'] before:absolute before:-left-[21px] before:top-5 before:w-4 before:h-0.5 before:bg-[#e2e8f0]' 
                                                        : 'bg-[#fdf8f6] border-[#f5e6e0] before:content-[\'\'] before:absolute before:-left-[21px] before:top-5 before:w-4 before:h-0.5 before:bg-[#f5e6e0]'
                                                }`}>
                                                    <p className={`text-sm font-semibold leading-relaxed ${isAdmin ? 'text-[#0f172a]' : 'text-[#3e2723]'}`}>{reply.message}</p>
                                                    <span className="text-[10px] text-[#64748b] font-bold mt-2 block opacity-70 tracking-tight">{new Date(reply.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Reply Input for User */}
                            <div className="mt-6 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col gap-3">
                                    <textarea 
                                        className="w-full text-sm font-medium p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:bg-white transition-all placeholder:text-gray-400 min-h-[100px] resize-none"
                                        placeholder="Type your follow-up message here..."
                                        value={userReplyText}
                                        onChange={(e) => setUserReplyText(e.target.value)}
                                        disabled={isReplying}
                                    />
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => handleUserReply(msg._id)}
                                            disabled={isReplying || !userReplyText.trim()}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                                                isReplying || !userReplyText.trim()
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                                    : 'bg-[#5D4037] text-white hover:bg-[#3E2723] shadow-[#5D4037]/20'
                                            }`}
                                        >
                                            {isReplying ? (
                                                <><FaSpinner className="animate-spin" /> Sending...</>
                                            ) : (
                                                <><FaPaperPlane /> Send Reply</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 line-clamp-1 italic mt-1 font-medium opacity-80">
                            {msg.message}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ────────────────────────────────────────────────
//  SECTION: User Reviews Tab (NGO Style)
// ────────────────────────────────────────────────
export const UserReviewsTab = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/reviews/ngo/${userId}`);
                setReviews(res.data.data || []);
            } catch { toast.error('Failed to load reviews'); }
            finally { setLoading(false); }
        })();
    }, [userId]);

    if (loading) return <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-[#8D6E63]" size={28} /></div>;

    if (reviews.length === 0) return (
        <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <FaStar className="text-gray-200" size={32} />
            </div>
            <p className="text-gray-500 font-bold text-lg">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">Feedback from the community will appear here.</p>
        </div>
    );

    const averageRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length);

    return (
        <div className="space-y-6 px-1">
            <div className="bg-gradient-to-br from-[#FFF9F5] to-white rounded-2xl p-6 border border-amber-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-[#5D4037] tracking-tight">My Reputation</h2>
                    <p className="text-sm text-gray-500 font-semibold opacity-80">What others are saying about your contributions.</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-4xl font-black text-[#5D4037] leading-none mb-1">{averageRating.toFixed(1)}</div>
                        <div className="flex gap-0.5 justify-center">
                            {[1, 2, 3, 4, 5].map(s => (
                                <FaStar key={s} size={12} color={s <= Math.round(averageRating) ? '#f59e0b' : '#d1d5db'} />
                            ))}
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-amber-100 mx-2"></div>
                    <div>
                        <div className="text-xl font-black text-[#5D4037] leading-none tracking-tight">{reviews.length}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest leading-none">Total Reviews</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((r, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-[#5D4037] border border-gray-100 shadow-sm">
                                    <FaUserCircle size={28} className="opacity-80" />
                                </div>
                                <div>
                                    <div className="font-extrabold text-[#3E2723] text-base leading-tight mb-1">{r.userName || 'Anonymous User'}</div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-70">{new Date(r.createdAt || r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <FaStar key={s} size={14} color={s <= r.rating ? '#f59e0b' : '#e5e7eb'} />
                                ))}
                            </div>
                        </div>
                        {r.comment && (
                            <div className="relative">
                                <div className="text-gray-600 text-sm leading-relaxed bg-gray-50/80 p-4 rounded-2xl font-medium italic border border-gray-50">
                                    "{r.comment}"
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
