import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaGlobe, FaPhone, FaMapMarkerAlt, FaEnvelope, FaPen } from 'react-icons/fa';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import RatingSubmission from '../components/RatingSubmission';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Mock Data for NGOs (Ideally fetch from API)
const MOCK_NGOS = [
    {
        id: '1',
        name: "Kathmandu Animal Treatment Centre (KAT)",
        description: "A non-profit organization dedicated to the humane management of animals in Nepal. We provide rescue, treatment, and rehabilitation for street dogs and cats.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
        location: "Budhanilkantha, Kathmandu",
        phone: "+977-1-4377777",
        email: "info@katcentre.org.np",
        website: "www.katcentre.org.np",
        rating: 4.5,
        reviewCount: 12,
        reviews: [
            { user: "Aarav S.", rating: 5, comment: "Doing amazing work for street dogs!", date: "2023-10-01" },
            { user: "Sarah J.", rating: 4, comment: "Very helpful staff.", date: "2023-09-15" }
        ]
    },
    {
        id: '2',
        name: "Sneha's Care",
        description: "One of the largest animal charities in Nepal, rescuing and rehabilitating street animals.",
        image: "https://www.snehacare.org/wp-content/uploads/2022/09/advocacy-2.jpg",
        location: "Lalitpur, Nepal",
        phone: "+977-9808645023",
        email: "info@snehacare.com",
        website: "www.snehacare.com",
        rating: 4.8,
        reviewCount: 20,
        reviews: []
    }
];

const REVIEWS_KEY = (id) => `ngoReviews_${id}`;

const NGODetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRateModal, setShowRateModal] = useState(false);

    useEffect(() => {
        const found = MOCK_NGOS.find(n => n.id === id);
        const base = found || MOCK_NGOS[0];
        // Merge mock seed reviews with localStorage reviews
        const stored = (() => {
            try { return JSON.parse(localStorage.getItem(REVIEWS_KEY(base.id))) || null; }
            catch { return null; }
        })();
        setNgo({ ...base, reviews: stored ?? base.reviews });
        setLoading(false);
    }, [id]);

    const handleReviewSubmit = (review) => {
        const newReviews = [review, ...(ngo.reviews || [])];
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvg = totalRating / newReviews.length;
        // Persist to localStorage
        localStorage.setItem(REVIEWS_KEY(ngo.id), JSON.stringify(newReviews));
        setNgo(prev => ({
            ...prev,
            reviews: newReviews,
            reviewCount: newReviews.length,
            rating: newAvg
        }));
    };

    if (loading) return <div className="container p-4">Loading NGO details...</div>;
    if (!ngo) return <div className="container p-4">NGO not found</div>;

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1000px' }}>
            <div className="ngo-header-card">
                <div className="ngo-cover" style={{ backgroundImage: `url(${ngo.image})` }}></div>
                <div className="ngo-info-main">
                    <h1>{ngo.name}</h1>
                    <div className="rating-summary">
                        <span className="rating-score">{ngo.rating?.toFixed(1)}</span>
                        <StarRating rating={ngo.rating || 0} />
                        <span className="review-count">({ngo.reviewCount} reviews)</span>
                    </div>
                    <div className="contact-info">
                        <span><FaMapMarkerAlt /> {ngo.location}</span>
                        <span><FaPhone /> {ngo.phone}</span>
                        <span><FaEnvelope /> {ngo.email}</span>
                        <span><FaGlobe /> {ngo.website}</span>
                    </div>
                </div>
            </div>

            <div className="ngo-content-grid">
                <div className="left-col">
                    <div className="section-card">
                        <h2>About Us</h2>
                        <p>{ngo.description}</p>
                        <Link to={`/donate?ngoId=${ngo.id}`} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Donate to Support</Link>
                    </div>

                    <div className="section-card">
                        <div className="section-header">
                            <h2>Reviews & Ratings</h2>
                            {user ? (
                                <button className="btn-rate" onClick={() => setShowRateModal(true)}>
                                    <FaPen /> Write a Review
                                </button>
                            ) : (
                                <Link to="/login" className="login-link">Login to rate</Link>
                            )}
                        </div>
                        <ReviewList reviews={ngo.reviews} />
                    </div>
                </div>

                <div className="right-col">
                    <div className="section-card">
                        <h3>Operating Hours</h3>
                        <ul className="ops-hours">
                            <li><span>Mon - Fri:</span> 9:00 AM - 5:00 PM</li>
                            <li><span>Saturday:</span> 10:00 AM - 2:00 PM</li>
                            <li><span>Sunday:</span> Closed</li>
                        </ul>
                    </div>

                    {/* Placeholder for pets listed by this NGO */}
                    <div className="section-card">
                        <h3>Available Pets</h3>
                        <p style={{ fontStyle: 'italic', color: '#666' }}>Pets from this NGO will appear here.</p>
                        <Link to="/pet-find" className="btn-link">Browse All Pets</Link>
                    </div>
                </div>
            </div>

            {showRateModal && (
                <RatingSubmission
                    ngoName={ngo.name}
                    userName={user?.name || user?.username || localStorage.getItem('loggedInUser') || 'Anonymous'}
                    onClose={() => setShowRateModal(false)}
                    onSubmit={handleReviewSubmit}
                />
            )}

            <style>{`
                .ngo-header-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    margin-bottom: 2rem;
                }
                .ngo-cover {
                    height: 250px;
                    background-size: cover;
                    background-position: center;
                }
                .ngo-info-main {
                    padding: 2rem;
                }
                .ngo-info-main h1 { margin: 0 0 0.5rem 0; color: #3E2723; }
                .rating-summary {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 1.5rem;
                }
                .rating-score {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #ffc107;
                }
                .review-count { color: #666; font-size: 0.9rem; }
                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    color: #555;
                }
                .contact-info span { display: flex; align-items: center; gap: 8px; }
                
                .ngo-content-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                @media (min-width: 900px) {
                    .ngo-content-grid { grid-template-columns: 2fr 1fr; }
                }
                
                .section-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .btn-rate {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: #fff;
                    border: 1px solid #5d4037;
                    color: #5d4037;
                    padding: 5px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-rate:hover { background: #f0f0f0; }
                .ops-hours {
                    list-style: none;
                    padding: 0;
                }
                .ops-hours li {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #eee;
                }
                .btn-link { color: var(--color-primary); font-weight: bold; text-decoration: none; }
            `}</style>
        </div>
    );
};

export default NGODetails;
