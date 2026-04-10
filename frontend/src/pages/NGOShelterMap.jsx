import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt, FaPhone, FaSearch, FaDirections, FaExternalLinkAlt, FaCrosshairs, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../services/axios';

// Haversine distance calculator
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for Verified vs Unverified NGOs
const verifiedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const unverifiedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function UpdateMapCenter({ center, zoom = 13 }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo([center.lat, center.lng], zoom, { animate: true, duration: 1.5 });
    }, [center, map, zoom]);
    return null;
}

const MAP_CENTER = [27.7172, 85.3240]; // Kathmandu

// Fallback/demo NGO locations perfectly matching the Donate page
const DEMO_NGOS = [
    { _id: 'mayakochhaano_5', name: 'Maya ko Chhaano', location: 'Kathmandu', phone: '+977 9800000004', lat: 27.7172, lng: 85.3240, isVerified: true, isDemo: true },
    { _id: 'animalnepal_1', name: 'Animal Nepal', location: 'Nakkhu, Lalitpur', phone: '+977 9841111111', lat: 27.6644, lng: 85.3188, isVerified: true, isDemo: true },
    { _id: 'snehacare_2', name: "Sneha's Care", location: 'Bhaisepati, Lalitpur', phone: '+977 9842424242', lat: 27.6480, lng: 85.3000, isVerified: true, isDemo: true },
    { _id: 'katcentre_3', name: 'KAT Centre (Kathmandu Animal Treatment)', location: 'Budhanilkantha, Kathmandu', phone: '+977 9843810363', lat: 27.7650, lng: 85.3620, isVerified: true, isDemo: true },
    { _id: 'nawrc_4', name: 'NAWRC (Nepal Animal Welfare)', location: 'Banepa, Kavre', phone: '+977 9851122334', lat: 27.6330, lng: 85.5270, isVerified: true, isDemo: true },
];

export default function NGOShelterMap() {
    const [ngos, setNgos] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(true);
    const [userLoc, setUserLoc] = useState(null);
    const [locError, setLocError] = useState('');

    useEffect(() => {
        fetchNGOs();
    }, []);

    const fetchNGOs = async () => {
        try {
            const res = await api.get('/admin/ngos/public');
            let dbNgos = [];
            if (res.data.success && res.data.data.length > 0) {
                // Only show NGOs that have provided real coordinates
                dbNgos = res.data.data.filter(ngo => ngo.lat && ngo.lng);
            }
            
            // Merge actual DB NGOs with DEMO_NGOS (Donate NGOs) so they both appear
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
            setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocError('');
        }, () => {
            setLocError("Unable to retrieve your location. Please check browser permissions.");
        });
    };

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

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#5D4037] flex items-center justify-center gap-3">
                        <FaMapMarkerAlt className="text-[#8D6E63]" />
                        NGO & Shelter Finder
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">Find verified NGOs and animal shelters near you</p>
                </div>

                {/* Search & Actions */}
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
                            title="Find shelters closest to me"
                            className="flex items-center justify-center gap-2 bg-[#5D4037] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm hover:bg-[#4E342E] transition-colors"
                        >
                            <FaCrosshairs /> Locate Me
                        </button>
                        <button
                            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                            title="Toggle officially verified shelters"
                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm transition-colors border-2 ${showVerifiedOnly ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {showVerifiedOnly ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} className="text-gray-400" />} 
                            Verified Only
                        </button>
                    </div>
                </div>
                {locError && <p className="text-red-500 text-sm text-center font-semibold m-0">{locError}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar list */}
                    <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                        {filtered.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-10">No NGOs found</p>
                        ) : filtered.map(ngo => (
                            <button
                                key={ngo._id}
                                onClick={() => setSelected(ngo)}
                                className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all shadow-sm group hover:shadow-md ${selected?._id === ngo._id ? 'border-[#8D6E63] bg-amber-50' : 'border-gray-100 hover:border-[#8D6E63]/30'
                                    }`}
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

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 h-[540px] overflow-hidden shadow-sm relative z-0">
                            <MapContainer center={MAP_CENTER} zoom={11} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {userLoc && (
                                    <>
                                        <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                                            <Popup>
                                                <div className="text-center font-bold text-sm text-green-700 m-0">
                                                    📍 You are here
                                                </div>
                                            </Popup>
                                        </Marker>
                                        <UpdateMapCenter center={userLoc} zoom={11} />
                                    </>
                                )}
                                {selected && <UpdateMapCenter center={selected} zoom={14} />}
                                {filtered.map(ngo => (
                                    <Marker 
                                        key={ngo._id} 
                                        position={[ngo.lat, ngo.lng]}
                                        icon={ngo.isVerified ? verifiedIcon : unverifiedIcon}
                                        eventHandlers={{ click: () => setSelected(ngo) }}
                                    >
                                        <Popup>
                                            <div className="min-w-[180px]">
                                                <p className="font-bold text-sm text-gray-800 m-0 mb-1">{ngo.name}</p>
                                                {ngo.isVerified && <p className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded border border-blue-100 inline-block m-0 mb-2">Verified</p>}
                                                <p className="text-xs text-gray-500 m-0">📍 {ngo.address || ngo.location}</p>
                                                {ngo.phone && <p className="text-xs text-gray-500 m-0 mt-1">📞 {ngo.phone}</p>}
                                                {ngo.distance !== undefined && <p className="text-xs text-[#8D6E63] font-bold mt-1 mb-1">🚗 {ngo.distance.toFixed(1)} km away</p>}
                                                
                                                <div className="mt-3 flex flex-col gap-2">
                                                    <a 
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${ngo.lat},${ngo.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full bg-gray-100 text-gray-700 py-1.5 px-2 rounded text-xs font-semibold text-center flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
                                                    >
                                                        <FaDirections /> Directions
                                                    </a>
                                                    {ngo.isDemo ? (
                                                        <span className="w-full bg-gray-100 text-gray-400 py-1.5 px-2 rounded text-xs font-semibold text-center">Demo Profile</span>
                                                    ) : (
                                                        <Link 
                                                            to={`/ngo/${ngo._id}`}
                                                            className="w-full bg-[#5D4037] text-white py-1.5 px-2 rounded text-xs font-semibold text-center flex items-center justify-center gap-1 hover:bg-[#4E342E] transition-colors"
                                                        >
                                                            <FaExternalLinkAlt size={10} /> View Profile
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
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
