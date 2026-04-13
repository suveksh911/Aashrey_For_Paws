import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaPhone, FaSearch, FaDirections, FaExternalLinkAlt, FaCrosshairs, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../services/axios';

// Haversine distance calculator - Kept identical
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const mapContainerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 27.7172, lng: 85.3240 };

// Google Maps Marker Icons
const ICONS = {
    verified: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    unverified: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    user: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
};

const DEMO_NGOS = [
    { _id: 'mayakochhaano_5', name: 'Maya ko Chhaano', location: 'Kathmandu', phone: '+977 9800000004', lat: 27.7172, lng: 85.3240, isVerified: true, isDemo: true },
    { _id: 'animalnepal_1', name: 'Animal Nepal', location: 'Nakkhu, Lalitpur', phone: '+977 9841111111', lat: 27.6644, lng: 85.3188, isVerified: true, isDemo: true },
    { _id: 'snehacare_2', name: "Sneha's Care", location: 'Bhaisepati, Lalitpur', phone: '+977 9842424242', lat: 27.6480, lng: 85.3000, isVerified: true, isDemo: true },
    { _id: 'katcentre_3', name: 'KAT Centre (Kathmandu Animal Treatment)', location: 'Budhanilkantha, Kathmandu', phone: '+977 9843810363', lat: 27.7650, lng: 85.3620, isVerified: true, isDemo: true },
    { _id: 'nawrc_4', name: 'NAWRC (Nepal Animal Welfare)', location: 'Banepa, Kavre', phone: '+977 9851122334', lat: 27.6330, lng: 85.5270, isVerified: true, isDemo: true },
];

export default function NGOShelterMap() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [ngos, setNgos] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(true);
    const [userLoc, setUserLoc] = useState(null);
    const [locError, setLocError] = useState('');
    const [mapInstance, setMapInstance] = useState(null);

    useEffect(() => {
        fetchNGOs();
    }, []);

    const fetchNGOs = async () => {
        try {
            const res = await api.get('/admin/ngos/public');
            let dbNgos = [];
            if (res.data.success && res.data.data.length > 0) {
                dbNgos = res.data.data.filter(ngo => ngo.lat && ngo.lng);
            }
            const merged = [...dbNgos];
            DEMO_NGOS.forEach(demoNgo => {
                const exists = merged.find(m => 
                    m.name.toLowerCase() === demoNgo.name.toLowerCase() ||
                    m._id === demoNgo._id
                );
                if (!exists) merged.push(demoNgo);
            });
            setNgos(merged);
        } catch {
            setNgos(DEMO_NGOS);
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            setLocError("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLoc(loc);
            setLocError('');
            if (mapInstance) mapInstance.panTo(loc);
        }, () => {
            setLocError("Unable to retrieve your location. Please check browser permissions.");
        });
    };

    // Smooth panning when selection changes
    useEffect(() => {
        if (selected && mapInstance) {
            mapInstance.panTo({ lat: selected.lat, lng: selected.lng });
        }
    }, [selected, mapInstance]);

    let filtered = ngos.filter(n =>
        (n.name?.toLowerCase().includes(search.toLowerCase()) ||
         (n.address || n.location)?.toLowerCase().includes(search.toLowerCase())) &&
        (!showVerifiedOnly || n.isVerified)
    );

    if (userLoc) {
        filtered = filtered.map(ngo => ({
            ...ngo,
            distance: haversine(userLoc.lat, userLoc.lng, ngo.lat, ngo.lng)
        })).sort((a, b) => a.distance - b.distance);
    }

    if (!isLoaded) return <div className="text-center p-10">Loading Maps...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#5D4037] flex items-center justify-center gap-3">
                        <FaMapMarkerAlt className="text-[#8D6E63]" /> NGO & Shelter Finder
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">Find verified NGOs and animal shelters near you</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto w-full">
                    <div className="relative flex-1 w-full">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or city…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleLocateMe}
                            className="flex items-center justify-center gap-2 bg-[#5D4037] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm hover:bg-[#4E342E] transition-colors"
                        >
                            <FaCrosshairs /> Locate Me
                        </button>
                        <button
                            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm transition-colors border-2 ${showVerifiedOnly ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {showVerifiedOnly ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} className="text-gray-400" />} 
                            Verified Only
                        </button>
                    </div>
                </div>
                {locError && <p className="text-red-500 text-sm text-center font-semibold m-0">{locError}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                        {filtered.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-10">No NGOs found</p>
                        ) : filtered.map(ngo => (
                            <button
                                key={ngo._id}
                                onClick={() => setSelected(ngo)}
                                className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all shadow-sm group hover:shadow-md ${selected?._id === ngo._id ? 'border-[#8D6E63] bg-amber-50' : 'border-gray-100 hover:border-[#8D6E63]/30'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-[#3E2723] text-sm">{ngo.name}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                            <FaMapMarkerAlt className="text-[#8D6E63]" size={10} /> {ngo.address || ngo.location}
                                        </p>
                                        {ngo.phone && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                <FaPhone size={10} className="text-[#8D6E63]" /> {ngo.phone}
                                            </p>
                                        )}
                                        {ngo.distance !== undefined && (
                                            <p className="text-xs text-[#8D6E63] font-bold mt-1.5">🚗 {ngo.distance.toFixed(1)} km away</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end h-full gap-2 justify-between min-h-[60px]">
                                        {ngo.isVerified && (
                                            <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                                Verified
                                            </span>
                                        )}
                                        <FaExternalLinkAlt className="text-gray-300 group-hover:text-[#8D6E63] transition-colors mt-auto" size={12} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 h-[540px] overflow-hidden shadow-sm relative z-0">
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={selected ? { lat: selected.lat, lng: selected.lng } : (userLoc || DEFAULT_CENTER)}
                                zoom={selected ? 14 : 11}
                                onLoad={map => setMapInstance(map)}
                            >
                                {userLoc && <MarkerF position={userLoc} icon={ICONS.user} title="You are here" />}
                                {filtered.map(ngo => (
                                    <MarkerF 
                                        key={ngo._id} 
                                        position={{ lat: ngo.lat, lng: ngo.lng }}
                                        icon={ngo.isVerified ? ICONS.verified : ICONS.unverified}
                                        onClick={() => setSelected(ngo)}
                                    />
                                ))}
                                {selected && (
                                    <InfoWindowF 
                                        position={{ lat: selected.lat, lng: selected.lng }} 
                                        onCloseClick={() => setSelected(null)}
                                    >
                                        <div className="min-w-[180px] p-1">
                                            <p className="font-bold text-sm text-gray-800 m-0 mb-1">{selected.name}</p>
                                            {selected.isVerified && <p className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 inline-block m-0 mb-2">Verified</p>}
                                            <p className="text-xs text-gray-500 m-0">📍 {selected.address || selected.location}</p>
                                            {selected.phone && <p className="text-xs text-gray-500 m-0 mt-1">📞 {selected.phone}</p>}
                                            {selected.distance !== undefined && <p className="text-xs text-[#8D6E63] font-bold mt-1 mb-1">🚗 {selected.distance.toFixed(1)} km away</p>}
                                            
                                            <div className="mt-3 flex flex-col gap-2">
                                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gray-100 text-gray-700 py-1.5 px-2 rounded text-xs font-semibold text-center flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors">
                                                    <FaDirections size={14} /> Directions
                                                </a>
                                                <Link to={selected.isDemo ? '#' : `/ngo/${selected._id}`} className="w-full bg-[#5D4037] text-white py-1.5 px-2 rounded text-xs font-semibold text-center flex items-center justify-center gap-1 hover:bg-[#4E342E] transition-colors">
                                                    <FaExternalLinkAlt size={10} /> View Profile
                                                </Link>
                                            </div>
                                        </div>
                                    </InfoWindowF>
                                )}
                            </GoogleMap>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                        { label: 'Total Shelters', value: ngos.length },
                        { label: 'Verified NGOs', value: ngos.filter(n => n.isVerified).length },
                        { label: 'Cities Covered', value: [...new Set(ngos.map(n => n.address || n.location))].length },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-3xl font-bold text-[#5D4037]">{s.value}</p>
                            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
