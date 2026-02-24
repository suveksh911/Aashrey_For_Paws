import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCreditCard, FaUniversity, FaCheckCircle, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import NGOVerifiedBadge from '../components/NGOVerifiedBadge';

const NGOs = [
    {
        id: 1,
        name: "Kathmandu Animal Treatment Centre (KAT)",
        description: "A non-profit organization dedicated to the humane management of animals in Nepal.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
        location: "Budhanilkantha, Kathmandu",
        phone: "+977-1-4377777",
        website: "www.katcentre.org.np",
        isVerified: true,
        bank: {
            bankName: "Standard Chartered Bank",
            accountName: "KAT Centre Nepal",
            accountNumber: "01-1234567-01",
            branch: "Naya Baneshwor"
        }
    },
    {
        id: 2,
        name: "Sneha's Care",
        description: "One of the largest animal charities in Nepal, rescuing and rehabilitating street animals.",
        image: "https://www.snehacare.org/wp-content/uploads/2022/09/advocacy-2.jpg",
        location: "Lalitpur, Nepal",
        phone: "+977-9808645023",
        website: "www.snehacare.com",
        isVerified: true,
        bank: {
            bankName: "Himalayan Bank Ltd.",
            accountName: "Sneha's Care",
            accountNumber: "019-0011-2233-44",
            branch: "Pulchowk"
        }
    },
    {
        id: 3,
        name: "Street Dog Care",
        description: "Providing medical care and shelter to street dogs in the Boudha area since 2009.",
        image: "https://www.streetdogcare.org/wp-content/uploads/2022/12/Screenshot-2022-12-16-at-13.10.31-225x300.png",
        location: "Boudha, Kathmandu",
        phone: "+977-9841075383",
        website: "www.streetdogcare.org",
        isVerified: false,
        bank: {
            bankName: "Laxmi Bank",
            accountName: "Street Dog Care",
            accountNumber: "005-555-888-999",
            branch: "Boudha"
        }
    },
    {
        id: 4,
        name: "Animal Nepal",
        description: "Working to improve the lives of animals through rescue, rehabilitation, and advocacy.",
        image: "https://www.animalnepal.org.np/wp-content/uploads/2019/06/49431920_10156263612099480_4991738204047540224_o-280x200.jpg",
        location: "Dobighat, Lalitpur",
        phone: "+977-1-5538068",
        website: "www.animalnepal.org",
        isVerified: true,
        bank: {
            bankName: "Nabil Bank",
            accountName: "Animal Nepal",
            accountNumber: "120-101-777-222",
            branch: "Patan"
        }
    }
];



// ============================================================
//  Main Donate component
// ============================================================
function Donate() {
    const [searchParams] = useSearchParams();
    const [selectedNgo, setSelectedNgo] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // If campaign page passed ?ngoId=X, pre-select that NGO
    useEffect(() => {
        const ngoId = searchParams.get('ngoId');
        if (ngoId) {
            const found = NGOs.find(n => n.id === Number(ngoId));
            if (found) setSelectedNgo(found);
        }
    }, [searchParams]);

    useEffect(() => {
        if (selectedNgo) {
            const el = document.getElementById('donation-form-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, 0);
        }
    }, [selectedNgo]);


    const handleDonate = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return toast.error('Please enter a valid amount');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            toast.success(`Donation of Rs. ${amount} to ${selectedNgo?.name} successful! 🎉`);
        }, 1500);
    };

    const resetForm = () => {
        setSuccess(false);
        setAmount('');
        setSelectedNgo(null);
    };

    // ── Success screen ────────────────────────────────────────
    if (success) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <FaCheckCircle size={80} color="#28a745" style={{ marginBottom: '2rem' }} />
                <h1>Thank You! 🎉</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>
                    Your donation of <strong>Rs. {amount}</strong> to <strong>{selectedNgo?.name}</strong> has been processed.<br />
                    Thank you for using Aashrey For Paws to support this cause.
                </p>
                <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={resetForm}>
                    Back to NGOs
                </button>
            </div>
        );
    }

    // ── NGO list ──────────────────────────────────────────────
    if (!selectedNgo) {
        return (
            <div className="container" style={{ padding: '3rem 2rem' }}>
                <div className="donate-header">
                    <h1>Our Partner NGOs</h1>
                    <p>Select an organization to view their details, read reviews, and make a donation.</p>
                </div>

                <div className="ngo-grid">
                    {NGOs.map(ngo => (
                        <div key={ngo.id} className="ngo-card">
                            <div className="ngo-image" style={{ backgroundImage: `url(${ngo.image})` }} />
                            <div className="ngo-content">
                                <div style={{ marginBottom: '6px' }}>
                                    <NGOVerifiedBadge isVerified={ngo.isVerified} compact />
                                </div>
                                <h3>{ngo.name}</h3>
                                <p className="ngo-desc">{ngo.description}</p>
                                <div className="ngo-details">
                                    <span><FaGlobe /> {ngo.location}</span>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                    onClick={() => setSelectedNgo(ngo)}
                                >
                                    💳 Donate to Support
                                </button>
                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <Link to={`/ngo/${ngo.id}`} className="text-primary" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>
                                        View Full Profile →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <style>{`
                    .donate-header { text-align: center; margin-bottom: 3rem; }
                    .donate-header h1 { color: var(--color-primary-dark); font-size: 2.5rem; margin-bottom: 0.5rem; }
                    .donate-header p { color: #666; font-size: 1.05rem; }
                    .ngo-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 2rem;
                    }
                    .ngo-card {
                        background: white; border-radius: var(--radius-md);
                        overflow: hidden; box-shadow: var(--shadow-md);
                        transition: transform 0.2s; border: 1px solid var(--color-border);
                        display: flex; flex-direction: column;
                    }
                    .ngo-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
                    .ngo-image { height: 220px; background-size: cover; background-position: center; }
                    .ngo-content { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
                    .ngo-content h3 { color: var(--color-text); margin-bottom: 0.5rem; }
                    .ngo-desc { font-size: 0.9rem; color: var(--color-text-light); margin-bottom: 0.75rem; line-height: 1.5; }
                    .ngo-details { font-size: 0.85rem; color: #666; display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }

                    /* Reviews */
                    .ngo-reviews { margin-top: 0.75rem; border-top: 1px solid #f0e8e5; padding-top: 0.75rem; }
                    .reviews-summary { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
                    .avg-badge { display: flex; align-items: center; gap: 5px; font-size: 0.85rem; color: #555; }
                    .review-count { color: #999; font-size: 0.8rem; }
                    .no-reviews-text { font-size: 0.8rem; color: #bbb; font-style: italic; }
                    .btn-write-review {
                        background: none; border: 1px solid var(--color-primary);
                        color: var(--color-primary); padding: 3px 10px; border-radius: 20px;
                        font-size: 0.78rem; cursor: pointer; transition: all 0.2s;
                    }
                    .btn-write-review:hover { background: var(--color-primary); color: white; }
                    .reviews-list { display: flex; flex-direction: column; gap: 6px; }
                    .review-item { background: #fdf8f6; padding: 8px 10px; border-radius: 8px; }
                    .review-item-header { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; flex-wrap: wrap; }
                    .ri-user { font-weight: 600; font-size: 0.82rem; color: #5d4037; }
                    .ri-date { font-size: 0.75rem; color: #bbb; margin-left: auto; }
                    .ri-comment { margin: 0; font-size: 0.83rem; color: #666; font-style: italic; }
                    .btn-toggle-reviews { background: none; border: none; color: var(--color-primary); font-size: 0.8rem; cursor: pointer; padding: 4px 0; }
                    .btn-toggle-reviews:hover { text-decoration: underline; }
                `}</style>
            </div>
        );
    }

    // ── Donation payment form ─────────────────────────────────
    return (
        <div className="container" style={{ padding: '3rem 2rem' }}>
            <button className="btn-back" onClick={() => setSelectedNgo(null)}>
                <FaArrowLeft /> Back to NGO List
            </button>

            <div className="selected-ngo-header">
                <h1>Supporting: {selectedNgo.name}</h1>
                <p>{selectedNgo.description}</p>
            </div>

            <div className="donate-grid" id="donation-form-section">
                {/* Online Payment */}
                <div className="donate-card">
                    <h2><FaCreditCard /> Donate Online</h2>
                    <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Enter your amount and proceed to payment.
                    </p>
                    <form onSubmit={handleDonate}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Donation Amount (Rs)
                            </label>
                            <div className="amount-options">
                                {[100, 250, 500, 1000].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={`btn-amount ${amount == val ? 'active' : ''}`}
                                        onClick={() => setAmount(val)}
                                    >
                                        Rs. {val}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                className="input-custom"
                                placeholder="Or type a custom amount..."
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Pay With
                            </label>
                            <div className="payment-methods">
                                <div className="payment-badge">💳 eSewa</div>
                                <div className="payment-badge">📱 Khalti</div>
                                <div className="payment-badge">🏦 ConnectIPS</div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? '⏳ Processing...' : `💳 Donate Rs. ${amount || '—'}`}
                        </button>
                    </form>
                </div>

                {/* Bank Transfer */}
                <div className="donate-card bank-info">
                    <h2><FaUniversity /> Direct Bank Transfer</h2>
                    <p>Transfer directly to {selectedNgo.name}.</p>

                    <div className="bank-details-box">
                        <div className="detail-row">
                            <span>Bank Name:</span>
                            <strong>{selectedNgo.bank.bankName}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Account Name:</span>
                            <strong>{selectedNgo.bank.accountName}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Account Number:</span>
                            <strong>{selectedNgo.bank.accountNumber}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Branch:</span>
                            <strong>{selectedNgo.bank.branch}</strong>
                        </div>
                    </div>

                    <div className="qr-box">
                        <img src="https://www.streetdogcare.org/wp-content/uploads/2022/12/319168432_689522445906387_2742276080662516844_n-1-683x1024.jpg" alt="Donate QR" />
                        <p>Scan to Pay via eSewa / Khalti</p>
                    </div>
                </div>
            </div>

            <style>{`
                .btn-back { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: var(--color-text-light); font-size: 1rem; cursor: pointer; margin-bottom: 2rem; }
                .btn-back:hover { color: var(--color-primary); text-decoration: underline; }
                .selected-ngo-header { text-align: center; margin-bottom: 3rem; }
                .selected-ngo-header h1 { color: var(--color-primary-dark); font-size: 2rem; margin-bottom: 0.5rem; }
                .donate-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 1000px; margin: 0 auto; }
                @media (min-width: 768px) { .donate-grid { grid-template-columns: 1fr 1fr; } }
                .donate-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 8px 24px rgba(93,64,55,0.15); border: 1px solid #EFEBE9; }
                .donate-card h2 { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; color: #3E2723; }
                .amount-options { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
                .btn-amount { flex: 1; min-width: 70px; padding: 0.5rem; border: 1px solid #EFEBE9; background: white; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
                .btn-amount:hover, .btn-amount.active { background: #8D6E63; color: white; border-color: #8D6E63; }
                .input-custom { width: 100%; padding: 0.75rem; border: 1px solid #EFEBE9; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
                .input-custom:focus { outline: 2px solid #8D6E63; }
                .payment-methods { display: flex; gap: 10px; flex-wrap: wrap; }
                .payment-badge { padding: 6px 14px; background: #fdf8f6; border: 1px solid #EFEBE9; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #5d4037; }
                .bank-details-box { background: #FDFBF7; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #eee; }
                .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                .qr-box { text-align: center; }
                .qr-box img { width: 160px; height: 200px; margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
}

export default Donate;
