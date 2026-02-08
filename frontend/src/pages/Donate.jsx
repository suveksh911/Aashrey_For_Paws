import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHandHoldingHeart, FaCreditCard, FaUniversity, FaCheckCircle, FaGlobe, FaPhone, FaArrowLeft } from 'react-icons/fa';
import KhaltiCheckout from "khalti-checkout-web";


const NGOs = [
    {
        id: 1,
        name: "Kathmandu Animal Treatment Centre (KAT)",
        description: "A non-profit organization dedicated to the humane management of animals in Nepal.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
        location: "Budhanilkantha, Kathmandu",
        phone: "+977-1-4377777",
        website: "www.katcentre.org.np",
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
        bank: {
            bankName: "Nabil Bank",
            accountName: "Animal Nepal",
            accountNumber: "120-101-777-222",
            branch: "Patan"
        }
    }
];

function Donate() {
    const [selectedNgo, setSelectedNgo] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    useEffect(() => {
        if (selectedNgo) {
            const formElement = document.getElementById('donation-form-section');
            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, 0);
        }
    }, [selectedNgo]);

    const handleDonate = (e) => {
        e.preventDefault();
        if (!amount) return toast.error("Please enter an amount");

        setLoading(true);

       
        let config = {
            "publicKey": "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
            "productIdentity": "donation_123",
            "productName": `Donation to ${selectedNgo?.name || 'Aashrey'}`,
            "productUrl": window.location.href,
            "eventHandler": {
                onSuccess(payload) {
                    console.log(payload);
                    setLoading(false);
                    setSuccess(true);
                    toast.success("Payment Successful!");
                },
                onError(error) {
                    console.log(error);
                    setLoading(false);
                    toast.error("Payment Failed. Please try again.");
                },
                onClose() {
                    console.log('widget is closing');
                    setLoading(false);
                }
            },
            "paymentPreference": ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
        };

        try {
            let checkout = new KhaltiCheckout(config);
            checkout.show({ amount: amount * 100 }); 
        } catch (error) {
            console.error("Khalti SDK error:", error);
            
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                toast.success(`(Mock) Donation to ${selectedNgo.name} successful!`);
            }, 1500);
        }
    };

    const resetForm = () => {
        setSuccess(false);
        setAmount('');
        setSelectedNgo(null);
    };

    if (success) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <FaCheckCircle size={80} color="#28a745" style={{ marginBottom: '2rem' }} />
                <h1>Thank You!</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>
                    Your donation of <strong>Rs. {amount}</strong> to <strong>{selectedNgo?.name}</strong> has been processed.<br />
                    Thank you for using Aashrey For Paws to support this cause.
                </p>
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '2rem' }}
                    onClick={resetForm}
                >
                    Back to NGOs
                </button>
            </div>
        )
    }


    if (!selectedNgo) {
        return (
            <div className="container" style={{ padding: '3rem 2rem' }}>
                <div className="donate-header">
                    <h1>Our Partner NGOs</h1>
                    <p>Select an organization to view their details and make a donation.</p>
                </div>

                <div className="ngo-grid">
                    {NGOs.map(ngo => (
                        <div key={ngo.id} className="ngo-card">
                            <div className="ngo-image" style={{ backgroundImage: `url(${ngo.image})` }}></div>
                            <div className="ngo-content">
                                <h3>{ngo.name}</h3>
                                <p className="ngo-desc">{ngo.description}</p>
                                <div className="ngo-details">
                                    <span><FaGlobe /> {ngo.location}</span>
                                </div>
                                <button
                                    className="btn btn-outline"
                                    style={{ marginTop: '1rem', width: '100%' }}
                                    onClick={() => setSelectedNgo(ngo)}
                                >
                                    Donate / View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <style>{`
                .donate-header { text-align: center; margin-bottom: 3rem; }
                .donate-header h1 { color: var(--color-primary-dark); font-size: 2.5rem; margin-bottom: 0.5rem; }
                .ngo-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
                    gap: 2rem; 
                }
                .ngo-card { 
                    background: white; 
                    border-radius: var(--radius-md); 
                    overflow: hidden; 
                    box-shadow: var(--shadow-md); 
                    transition: transform 0.2s;
                    border: 1px solid var(--color-border);
                }
                .ngo-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
                .ngo-image { height: 300px; background-size: cover; background-position: center; }
                .ngo-content { padding: 1.5rem; }
                .ngo-content h3 { color: var(--color-text); margin-bottom: 0.5rem; }
                .ngo-desc { font-size: 0.95rem; color: var(--color-text-light); margin-bottom: 1rem; line-height: 1.5; }
                .ngo-details { font-size: 0.9rem; color: #666; display: flex; gap: 1rem; }
                .btn-outline { 
                    border: 2px solid var(--color-primary); 
                    color: var(--color-primary); 
                    background: transparent; 
                    padding: 0.5rem 1rem; 
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-outline:hover { background: var(--color-primary); color: white; }
            `}</style>
            </div>
        );
    }


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
                { }
                <div className="donate-card">
                    <h2><FaCreditCard /> Donate Online</h2>
                    <form onSubmit={handleDonate}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Donation Amount (Rs)</label>
                            <div className="amount-options">
                                {[10, 25, 50, 100].map(val => (
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
                                placeholder="Type custom amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Card Details (Mock)</label>
                            <input type="text" className="input-custom" placeholder="0000 0000 0000 0000" disabled />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                <input type="text" className="input-custom" placeholder="MM/YY" disabled />
                                <input type="text" className="input-custom" placeholder="CVC" disabled />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Processing...' : `Donate`}
                        </button>
                    </form>
                </div>

                { }
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
            
            /* Reused Donate Styles */
            .donate-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 1000px; margin: 0 auto; }
            @media (min-width: 768px) { .donate-grid { grid-template-columns: 1fr 1fr; } }
            .donate-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 8px 24px rgba(93, 64, 55, 0.15); border: 1px solid #EFEBE9; }
            .donate-card h2 { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; color: #3E2723; }
            .amount-options { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
            .btn-amount { flex: 1; padding: 0.5rem; border: 1px solid #EFEBE9; background: white; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
            .btn-amount:hover, .btn-amount.active { background: #8D6E63; color: white; border-color: #8D6E63; }
            .input-custom { width: 100%; padding: 0.75rem; border: 1px solid #EFEBE9; border-radius: 8px; font-size: 1rem; }
            .input-custom:focus { outline: 2px solid #8D6E63; }
            .bank-details-box { background: #FDFBF7; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .qr-box { text-align: center; }
            .qr-box img { width: 200px; height: 250px; margin-bottom: 0.5rem; }
        `}</style>
        </div>
    );
}

export default Donate;
