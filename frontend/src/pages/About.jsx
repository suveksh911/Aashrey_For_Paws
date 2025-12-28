import React from 'react';
import Navbar from '../components/Navbar'; // Assuming there is a Navbar, if not I will check or create simple nav here.
// Actually, Navbar is not yet confirmed to exist in components, but Home likely used it or will use it.
// I will assume a layout or include a simple nav in App or Pages. 
// For now, I'll build the page content.

function About() {
    return (
        <div className="about-page">
            <div className="container">
                <header className="about-header">
                    <h1>About Aashrey For Paws</h1>
                    <p className="subtitle">Dedicated to giving every paw a loving home.</p>
                </header>

                <section className="about-content">
                    <div className="about-image">
                        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Happy Dog" />
                    </div>
                    <div className="about-text">
                        <h2>Our Mission</h2>
                        <p>
                            At Aashrey For Paws, we believe that every animal deserves a safe haven and a loving family.
                            Our mission is to rescue, rehabilitate, and rehome stray and abandoned animals, ensuring they
                            live a life full of dignity and joy.
                        </p>
                        <h2>Who We Are</h2>
                        <p>
                            We are a community of animal lovers, volunteers, and veterinarians working tirelessly to
                            make a difference. From providing medical care to organizing adoption drives, we are
                            committed to creating a world where no paw is left behind.
                        </p>
                    </div>
                </section>

                <section className="values-section">
                    <h2>Our Core Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <h3>Compassion</h3>
                            <p>We treat every living being with kindness and empathy.</p>
                        </div>
                        <div className="value-card">
                            <h3>Commitment</h3>
                            <p>We are dedicated to the lifelong well-being of our rescues.</p>
                        </div>
                        <div className="value-card">
                            <h3>Community</h3>
                            <p>We build strong networks to support animal welfare.</p>
                        </div>
                    </div>
                </section>
            </div>

            <style>{`
                .about-page {
                    padding: 4rem 0;
                    color: var(--color-text);
                }
                .about-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }
                .about-header h1 {
                    font-size: 2.5rem;
                    color: var(--color-primary-dark);
                    margin-bottom: 1rem;
                }
                .about-header .subtitle {
                    font-size: 1.2rem;
                    color: var(--color-text-light);
                }
                .about-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    margin-bottom: 4rem;
                }
                .about-image img {
                    width: 100%;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                }
                .about-text h2 {
                    color: var(--color-primary);
                    margin-bottom: 1rem;
                    margin-top: 1.5rem;
                }
                .about-text p {
                    margin-bottom: 1.5rem;
                    font-size: 1.1rem;
                }
                .values-section {
                    background-color: var(--color-surface);
                    padding: 3rem;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    text-align: center;
                }
                .values-section h2 {
                    color: var(--color-primary-dark);
                    margin-bottom: 2rem;
                }
                .values-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                }
                .value-card {
                    padding: 1.5rem;
                    background-color: var(--color-background);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                }
                .value-card h3 {
                    color: var(--color-primary);
                    margin-bottom: 0.5rem;
                }

                @media (max-width: 768px) {
                    .about-content {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .about-header h1 {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default About;
