import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';

const center = { lat: 27.7172, lng: 85.3240 };
const containerStyle = { width: '100%', height: '100%' };

const MapComponent = ({ pets = [] }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [markers, setMarkers] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);

    useEffect(() => {
        if (pets.length > 0) {
            const processedMarkers = pets.map((pet) => {
                const lat = pet.lat || (27.7172 + (Math.random() - 0.5) * 0.1);
                const lng = pet.lng || (85.3240 + (Math.random() - 0.5) * 0.1);
                return { ...pet, lat, lng };
            });
            setMarkers(processedMarkers);
        }
    }, [pets]);

    if (!isLoaded) return <div style={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>;

    return (
        <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                }}
            >
                {markers.map(pet => (
                    <MarkerF 
                        key={pet._id || pet.id} 
                        position={{ lat: pet.lat, lng: pet.lng }}
                        onClick={() => setSelectedPet(pet)}
                    />
                ))}

                {selectedPet && (
                    <InfoWindowF
                        position={{ lat: selectedPet.lat, lng: selectedPet.lng }}
                        onCloseClick={() => setSelectedPet(null)}
                    >
                        {/* THE UI BELOW IS EXACTLY THE SAME AS YOUR ORIGINAL CODE */}
                        <div className="map-popup-card" style={{ width: '200px' }}>
                            <div className="popup-img" style={{ marginBottom: '8px' }}>
                                <img 
                                    src={selectedPet.image || selectedPet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} 
                                    alt={selectedPet.name} 
                                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px' }} 
                                />
                            </div>
                            <div className="popup-info">
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#5d4037' }}>{selectedPet.name}</h4>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#666' }}>{selectedPet.breed}</p>
                                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 'bold', color: selectedPet.adoptionStatus === 'Available' ? 'green' : 'red' }}>
                                    {selectedPet.adoptionStatus}
                                </p>
                                <Link 
                                    to={`/pet/${selectedPet._id}`} 
                                    style={{ display: 'block', background: '#5d4037', color: 'white', textAlign: 'center', padding: '6px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>
    );
};

export default React.memo(MapComponent);
