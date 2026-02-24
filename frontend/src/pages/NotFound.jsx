import React from 'react';
import { Link } from 'react-router-dom';
import { FaPaw } from 'react-icons/fa';

const NotFound = () => {
    return (
        <div style={styles.container}>
            <FaPaw size={80} color="#5d4037" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h1 style={styles.title}>404</h1>
            <h2 style={styles.subtitle}>Page Not Found</h2>
            <p style={styles.text}>Oops! The page you are looking for seems to have gone for a walk.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Go Home
            </Link>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center',
        padding: '2rem',
    },
    title: {
        fontSize: '6rem',
        color: '#5d4037',
        margin: 0,
        lineHeight: 1,
    },
    subtitle: {
        fontSize: '2rem',
        color: '#333',
        marginBottom: '1rem',
    },
    text: {
        color: '#666',
        marginBottom: '2rem',
        fontSize: '1.2rem',
    }
};

export default NotFound;
