import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaPaw, FaHome, FaBuilding, FaHeart, FaArrowRight, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const ROLES = [
    { id: 'Adopter', icon: <FaHeart />, label: 'Adopter', desc: 'Looking to adopt a pet' },
    { id: 'Owner', icon: <FaHome />, label: 'Pet Owner', desc: 'I have pets to list for adoption' },
    { id: 'NGO', icon: <FaBuilding />, label: 'NGO / Pet Shop', desc: 'Organization or certified pet shop' },
];

const HOUSING = ['Apartment', 'House with Garden', 'House without Garden', 'Farm', 'Other'];

export default function Signup() {
    const [step, setStep] = useState(1); // 1 = role select, 2 = main info, 3 = extra info
    const [role, setRole] = useState('Adopter');
    const [info, setInfo] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [extra, setExtra] = useState({
        // Common
        phone: '',
        address: '',
        // Owner-specific
        idProofType: 'Citizenship',
        // NGO-specific
        orgName: '',
        registrationNo: '',
        mission: '',
        website: '',
        // Adopter-specific
        housingType: 'Apartment',
        hasOtherPets: false,
        experience: '',
    });

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleMain = (e) => setInfo(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleExtra = (e) => {
        const { name, value, type, checked } = e.target;
        setExtra(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const validateStep2 = () => {
        if (!info.name || !info.email || !info.password || !info.confirmPassword) return 'Please fill all fields.';
        if (info.password.length < 6) return 'Password must be at least 6 characters.';
        if (info.password !== info.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const validateStep3 = () => {
        if (!extra.phone) return 'Phone number is required.';
        if (role === 'NGO' && !extra.orgName) return 'Organization name is required.';
        if (role === 'NGO' && !extra.registrationNo) return 'Registration number is required.';
        return null;
    };

    const handleNext = () => {
        if (step === 2) {
            const err = validateStep2();
            if (err) return toast.error(err);
        }
        setStep(s => s + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validateStep3();
        if (err) return toast.error(err);

        const payload = { ...info, role, ...extra };
        delete payload.confirmPassword;

        const result = await signup(payload);
        if (result.success) {
            toast.success('Account created successfully!');
            if (role === 'NGO') {
                toast.info('Please upload your verification documents to get your NGO verified.');
            }
            setTimeout(() => navigate('/login'), 1200);
        }
    };

    const progressPct = step === 1 ? 5 : step === 2 ? 45 : 90;

    return (
        <div className="su-wrapper">
            <div className="su-left">
                <div className="su-left-inner">
                    <div className="su-brand"><FaPaw /> Aashrey For Paws</div>
                    <h2>Join Our Community</h2>
                    <p>Whether you want to adopt, rehome, or run an animal welfare organization — we have a place for you.</p>
                    <div className="su-steps-hint">
                        <div className={`su-step-dot ${step >= 1 ? 'done' : ''}`}>1</div>
                        <div className="su-step-line" />
                        <div className={`su-step-dot ${step >= 2 ? 'done' : ''}`}>2</div>
                        <div className="su-step-line" />
                        <div className={`su-step-dot ${step >= 3 ? 'done' : ''}`}>3</div>
                    </div>
                    <div className="su-step-labels">
                        <span>Role</span><span>Details</span><span>Profile</span>
                    </div>
                </div>
            </div>

            <div className="su-right">
                <div className="su-card">
                    {/* Progress bar */}
                    <div className="su-progress-bar">
                        <div className="su-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>

                    {/* ── Step 1: Role Selection ── */}
                    {step === 1 && (
                        <div>
                            <div className="su-header">
                                <h1>Create Account</h1>
                                <p>Select your role to get started</p>
                            </div>
                            <div className="su-role-grid">
                                {ROLES.map(r => (
                                    <div key={r.id} className={`su-role-card ${role === r.id ? 'selected' : ''}`} onClick={() => setRole(r.id)}>
                                        <div className="su-role-icon">{r.icon}</div>
                                        <div className="su-role-name">{r.label}</div>
                                        <div className="su-role-desc">{r.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <button className="su-btn" onClick={() => setStep(2)}>
                                Continue as {role === 'NGO' ? 'NGO / Pet Shop' : role} <FaArrowRight />
                            </button>
                            <div className="su-footer-link">Already have an account? <Link to="/login">Log In</Link></div>
                        </div>
                    )}

                    {/* ── Step 2: Main Info ── */}
                    {step === 2 && (
                        <div>
                            <div className="su-header">
                                <h1>Your Details</h1>
                                <p>Basic account information</p>
                            </div>
                            <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
                                <div className="su-field">
                                    <label>Full Name *</label>
                                    <input name="name" placeholder="John Doe" value={info.name} onChange={handleMain} autoFocus autoComplete="off" />
                                </div>
                                <div className="su-field">
                                    <label>Email Address *</label>
                                    <input name="email" type="email" placeholder="you@example.com" value={info.email} onChange={handleMain} autoComplete="off" />
                                </div>
                                <div className="su-row">
                                    <div className="su-field">
                                        <label>Password *</label>
                                        <div className="password-input-wrapper">
                                            <input 
                                                name="password" 
                                                type={showPassword ? 'text' : 'password'} 
                                                placeholder="Min 6 characters" 
                                                value={info.password} 
                                                onChange={handleMain} 
                                                autoComplete="new-password"
                                            />
                                            <div 
                                                className="password-toggle-icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="su-field">
                                        <label>Confirm Password *</label>
                                        <div className="password-input-wrapper">
                                            <input 
                                                name="confirmPassword" 
                                                type={showConfirmPassword ? 'text' : 'password'} 
                                                placeholder="Repeat password" 
                                                value={info.confirmPassword} 
                                                onChange={handleMain} 
                                                autoComplete="new-password"
                                            />
                                            <div 
                                                className="password-toggle-icon"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="su-btn-row">
                                    <button type="button" className="su-btn-back" onClick={() => setStep(1)}><FaArrowLeft /> Back</button>
                                    <button type="submit" className="su-btn">Next <FaArrowRight /></button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Step 3: Role-Specific Extra Info ── */}
                    {step === 3 && (
                        <div>
                            <div className="su-header">
                                <h1>Complete Your Profile</h1>
                                <p>{role === 'NGO' ? 'Organization details for verification' : role === 'Owner' ? 'Pet owner information' : 'Your preferences'}</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                {/* COMMON FIELDS */}
                                <div className="su-row">
                                    <div className="su-field">
                                        <label>Phone Number *</label>
                                        <input name="phone" type="tel" placeholder="98XXXXXXXX" value={extra.phone} onChange={handleExtra} />
                                    </div>
                                    <div className="su-field">
                                        <label>Address</label>
                                        <input name="address" placeholder="City, District" value={extra.address} onChange={handleExtra} />
                                    </div>
                                </div>

                                {/* OWNER EXTRA */}
                                {role === 'Owner' && (
                                    <div>
                                        <div className="su-section-title">Identity Verification</div>
                                        <div className="su-field">
                                            <label>ID Proof Type</label>
                                            <select name="idProofType" value={extra.idProofType} onChange={handleExtra}>
                                                <option>Citizenship</option>
                                                <option>Passport</option>
                                                <option>Driving License</option>
                                                <option>Voter ID</option>
                                            </select>
                                        </div>
                                        <div className="su-field">
                                            <label>Brief Bio (Optional)</label>
                                            <textarea name="experience" rows={3} placeholder="Tell us about yourself and your pets…" value={extra.experience} onChange={handleExtra} />
                                        </div>
                                    </div>
                                )}

                                {/* NGO EXTRA */}
                                {role === 'NGO' && (
                                    <div>
                                        <div className="su-section-title">Organization Information</div>
                                        <div className="su-field">
                                            <label>Organization Name *</label>
                                            <input name="orgName" placeholder="Paw Helpers NGO" value={extra.orgName} onChange={handleExtra} />
                                        </div>
                                        <div className="su-row">
                                            <div className="su-field">
                                                <label>Registration Number *</label>
                                                <input name="registrationNo" placeholder="NGO-2025-XXXX" value={extra.registrationNo} onChange={handleExtra} />
                                            </div>
                                            <div className="su-field">
                                                <label>Website (Optional)</label>
                                                <input name="website" type="url" placeholder="https://…" value={extra.website} onChange={handleExtra} />
                                            </div>
                                        </div>
                                        <div className="su-field">
                                            <label>Mission Statement</label>
                                            <textarea name="mission" rows={3} placeholder="Briefly describe your mission…" value={extra.mission} onChange={handleExtra} />
                                        </div>
                                        <div className="su-ngo-note">
                                            🛡️ After account creation, you will need to upload verification documents. Our admin team will review and verify your organization within 3–5 business days.
                                        </div>
                                    </div>
                                )}

                                {/* ADOPTER EXTRA */}
                                {role === 'Adopter' && (
                                    <div>
                                        <div className="su-section-title">Adoption Preferences</div>
                                        <div className="su-field">
                                            <label>Housing Type</label>
                                            <select name="housingType" value={extra.housingType} onChange={handleExtra}>
                                                {HOUSING.map(h => <option key={h}>{h}</option>)}
                                            </select>
                                        </div>
                                        <div className="su-field">
                                            <label>Pet Experience (Optional)</label>
                                            <textarea name="experience" rows={3} placeholder="Describe your experience with pets…" value={extra.experience} onChange={handleExtra} />
                                        </div>
                                        <div className="su-checkbox-row">
                                            <input type="checkbox" name="hasOtherPets" id="hasOtherPets" checked={extra.hasOtherPets} onChange={handleExtra} />
                                            <label htmlFor="hasOtherPets">I currently have other pets at home</label>
                                        </div>
                                    </div>
                                )}

                                <div className="su-btn-row">
                                    <button type="button" className="su-btn-back" onClick={() => setStep(2)}><FaArrowLeft /> Back</button>
                                    <button type="submit" className="su-btn">Create Account ✓</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                /* ── Brown / Cream Brown Color Palette ──
                   Deep brown   : #3E2723
                   Mid brown    : #5D4037
                   Warm brown   : #8D6E63
                   Light brown  : #BCAAA4
                   Cream        : #EFEBE9
                   Pale cream   : #FDF8F6
                */

                .su-wrapper { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; }

                /* ── Left panel — deep warm brown gradient ── */
                .su-left {
                    width: 380px; min-width: 300px;
                    background: linear-gradient(160deg, #3E2723 0%, #5D4037 60%, #8D6E63 100%);
                    display: flex; align-items: center; padding: 3rem 2.5rem;
                    position: relative; overflow: hidden;
                }
                .su-left::before {
                    content: '🐾';
                    position: absolute; bottom: -20px; right: -20px;
                    font-size: 10rem; opacity: 0.06; pointer-events: none;
                }
                .su-left-inner { color: #EFEBE9; position: relative; }
                .su-brand {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 1rem; font-weight: 700; color: #FFCCBC;
                    margin-bottom: 2rem; letter-spacing: 0.02em;
                }
                .su-left h2 { font-size: 1.8rem; font-weight: 800; margin: 0 0 1rem; line-height: 1.3; color: #FFF8F6; }
                .su-left p { color: #D7CCC8; line-height: 1.65; font-size: 0.95rem; margin-bottom: 2.5rem; }

                /* Step dots — cream on brown */
                .su-steps-hint { display: flex; align-items: center; gap: 0; margin-bottom: 0.5rem; }
                .su-step-dot {
                    width: 32px; height: 32px; border-radius: 50%;
                    border: 2px solid #795548;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 0.85rem; color: #A1887F;
                    background: rgba(255,255,255,0.05); transition: all 0.3s;
                }
                .su-step-dot.done { background: #FFCCBC; border-color: #FFCCBC; color: #4E342E; }
                .su-step-line { flex: 1; height: 2px; background: #795548; }
                .su-step-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #A1887F; margin-top: 6px; }

                /* ── Right panel — warm cream bg ── */
                .su-right {
                    flex: 1; display: flex; align-items: flex-start; justify-content: center;
                    padding: 2rem 1.5rem;
                    background: linear-gradient(145deg, #FDF8F6 0%, #EFEBE9 100%);
                    overflow-y: auto;
                }
                .su-card {
                    background: #fff; border-radius: 20px; padding: 2.5rem;
                    width: 100%; max-width: 560px;
                    box-shadow: 0 8px 32px rgba(62,39,35,0.12);
                    border: 1px solid #E8DDD9;
                    margin: auto;
                }

                /* Progress bar — brown fill */
                .su-progress-bar { width: 100%; height: 5px; background: #EFEBE9; border-radius: 3px; margin-bottom: 2rem; }
                .su-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #8D6E63, #5D4037);
                    border-radius: 3px; transition: width 0.5s ease;
                }

                /* Headings */
                .su-header { margin-bottom: 1.8rem; }
                .su-header h1 { margin: 0 0 0.3rem; font-size: 1.6rem; font-weight: 800; color: #3E2723; }
                .su-header p { margin: 0; color: #8D6E63; font-size: 0.95rem; }

                /* Role cards */
                .su-role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 1.8rem; }
                .su-role-card {
                    border: 2px solid #EFEBE9; border-radius: 12px; padding: 1.2rem;
                    text-align: center; cursor: pointer; transition: all 0.22s; background: #FDF8F6;
                }
                .su-role-card:hover {
                    border-color: #8D6E63; transform: translateY(-3px);
                    box-shadow: 0 6px 18px rgba(93,64,55,0.15);
                }
                .su-role-card.selected {
                    border-color: #5D4037;
                    background: linear-gradient(135deg, #FFF8F6, #FBF0EC);
                    box-shadow: 0 6px 18px rgba(93,64,55,0.2);
                }
                .su-role-icon { font-size: 1.8rem; color: #8D6E63; margin-bottom: 8px; }
                .su-role-card.selected .su-role-icon { color: #5D4037; }
                .su-role-name { font-weight: 700; font-size: 0.9rem; color: #3E2723; margin-bottom: 4px; }
                .su-role-desc { font-size: 0.75rem; color: #A1887F; line-height: 1.4; }

                /* Form fields */
                .su-field { margin-bottom: 1.1rem; }
                .su-field label { display: block; font-weight: 600; font-size: 0.88rem; color: #5D4037; margin-bottom: 5px; }
                .su-field input, .su-field select, .su-field textarea {
                    width: 100%; padding: 10px 13px;
                    border: 1.5px solid #D7CCC8; border-radius: 9px;
                    font-size: 0.9rem; outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit; box-sizing: border-box;
                    background: #FDFAF9; color: #3E2723;
                }
                .su-field input:focus, .su-field select:focus, .su-field textarea:focus {
                    border-color: #8D6E63;
                    box-shadow: 0 0 0 3px rgba(141,110,99,0.15);
                    background: #fff;
                }
                .su-field input::placeholder { color: #BCAAA4; }
                .su-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

                /* Section divider title */
                .su-section-title {
                    font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.08em; color: #A1887F; margin: 1.2rem 0 0.8rem;
                    border-top: 1px solid #EFEBE9; padding-top: 1rem;
                }

                /* NGO note */
                .su-ngo-note {
                    background: #FFF8F1; border: 1px solid #FFCCBC;
                    border-radius: 9px; padding: 12px 14px; font-size: 0.85rem;
                    color: #6D4C41; margin-top: 0.8rem; line-height: 1.5;
                }

                /* Checkbox */
                .su-checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 0.8rem; font-size: 0.9rem; color: #5D4037; cursor: pointer; }
                .su-checkbox-row input { width: 16px; height: 16px; accent-color: #8D6E63; cursor: pointer; }

                /* Buttons */
                .su-btn {
                    width: 100%; padding: 13px;
                    background: linear-gradient(135deg, #8D6E63 0%, #5D4037 100%);
                    color: #fff; border: none; border-radius: 10px;
                    font-size: 1rem; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
                    margin-top: 0.5rem;
                    box-shadow: 0 4px 14px rgba(93,64,55,0.35);
                }
                .su-btn:hover { opacity: 0.93; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(93,64,55,0.45); }
                .su-btn:active { transform: translateY(0); }

                .su-btn-row { display: flex; gap: 10px; margin-top: 0.5rem; }
                .su-btn-row .su-btn { flex: 1; }
                .su-btn-back {
                    padding: 13px 18px;
                    background: #EFEBE9; border: 1.5px solid #D7CCC8;
                    border-radius: 10px; font-size: 0.95rem; font-weight: 600;
                    color: #6D4C41; cursor: pointer;
                    display: flex; align-items: center; gap: 6px; transition: background 0.2s;
                }
                .su-btn-back:hover { background: #D7CCC8; }

                /* Footer link */
                .su-footer-link { text-align: center; margin-top: 1.2rem; font-size: 0.88rem; color: #A1887F; }
                .su-footer-link a { color: #5D4037; font-weight: 700; text-decoration: none; }
                .su-footer-link a:hover { text-decoration: underline; }

                @media (max-width: 768px) {
                    .su-left { display: none; }
                    .su-right { background: #FDF8F6; }
                    .su-row { grid-template-columns: 1fr; }
                    .su-role-grid { grid-template-columns: 1fr; }
                    .su-card { padding: 1.5rem; box-shadow: none; border: none; background: transparent; }
                }
            `}</style>
        </div>
    );
}
