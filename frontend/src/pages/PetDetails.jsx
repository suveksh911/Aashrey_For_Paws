import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PetDetails() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPetDetails();
    }, [id]);

    const fetchPetDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/pets/${id}`);
            const result = await response.json();
            if (result.success) {
                setPet(result.data);
            } else {
                toast.error("Pet not found");
                navigate('/pet-find');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading details...</div>;
    if (!pet) return null;

    return (
        <div className="pet-details-page container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div className="details-wrapper">
                <div className="details-image">
                    <img src={pet.image} alt={pet.name} className="main-img" />
                    {pet.images && pet.images.length > 1 && (
                        <div className="img-gallery">
                            {pet.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`${pet.name} ${idx}`} onClick={(e) => document.querySelector('.main-img').src = img} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="details-content">
                    <h1>{pet.name}</h1>
                    <div className="tags">
                        <span className="tag breed">{pet.breed}</span>
                        <span className="tag age">{pet.age}</span>
                        <span className={`tag status ${pet.status.toLowerCase()}`}>{pet.status}</span>
                    </div>

                    <div className="description">
                        <h3>About {pet.name}</h3>
                        <p>{pet.description}</p>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Category:</strong> {pet.category}
                        </div>
                        <div className="info-item">
                            <strong>Location:</strong> {pet.location}
                        </div>
                        <div className="info-item">
                            <strong>Contact:</strong> {pet.contactInfo}
                        </div>
                    </div>

                    <button className="btn btn-primary adopt-btn" onClick={() => toast.info('Adoption request sent! (Mock)')}>
                        Adopt {pet.name}
                    </button>
                </div>
            </div>

            <style>{`
                .pet-details-page {
                    padding: 4rem 1rem;
                }
                .back-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-light);
                    cursor: pointer;
                    margin-bottom: 2rem;
                    font-size: 1rem;
                }
                .details-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                }
                .details-image {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .main-img {
                    width: 100%;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    object-fit: cover;
                    height: 400px;
                }
                .img-gallery {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                }
                .img-gallery img {
                    width: 80px;
                    height: 80px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    object-fit: cover;
                    border: 2px solid transparent;
                    transition: border-color 0.2s;
                }
                .img-gallery img:hover {
                    border-color: var(--color-primary);
                }
                .details-content h1 {
                    font-size: 3rem;
                    color: var(--color-primary-dark);
                    margin-bottom: 1rem;
                }
                .tags {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .tag {
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-sm);
                    background: var(--color-background);
                    font-weight: 500;
                    color: var(--color-text-light);
                    border: 1px solid var(--color-border);
                }
                .tag.status.available {
                    background-color: #E8F5E9;
                    color: #2E7D32;
                    border-color: #C8E6C9;
                }
                .description h3 {
                    color: var(--color-primary);
                    margin-bottom: 0.5rem;
                }
                .description p {
                    line-height: 1.8;
                    margin-bottom: 2rem;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: var(--color-surface);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                }
                .adopt-btn {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.2rem;
                }

                @media (max-width: 768px) {
                    .details-wrapper {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default PetDetails;
