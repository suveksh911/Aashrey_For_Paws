import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';
import MultiImageUpload from '../components/pet/MultiImageUpload';
import PetHealthRecord from '../components/pet/PetHealthForm';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { FaMapMarkerAlt } from 'react-icons/fa';

const MAP_CENTER = { lat: 27.7172, lng: 85.3240 }; // Kathmandu default
const MAP_CONTAINER_STYLE = { height: '100%', width: '100%' };
const MAP_DIV_STYLE = { height: '280px', width: '100%', zIndex: 0 };

const BREED_LISTS = {
    Dog: [
        'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund', 'Husky', 'Great Dane', 'Chihuahua', 'Pug', 'Shih Tzu', 'Doberman Pinscher', 'Pomeranian', 'Border Collie', 'Australian Shepherd', 'Shiba Inu', 'Greyhound', 'Dalmatian', 'Local/Mixed Breed'
    ],
    Cat: [
        'Persian Cat', 'Maine Coon', 'Ragdoll', 'Siamese Cat', 'Bengal Cat', 'Abyssinian', 'Birman', 'Sphynx Cat', 'Russian Blue', 'British Shorthair', 'Scottish Fold', 'American Shorthair', 'Bombay', 'Munchkin', 'Exotic Shorthair', 'Himalayan', 'Local/Mixed Breed'
    ],
    Bird: [
        'Parrot', 'Canary', 'Cockatiel', 'Budgie', 'Lovebird', 'Finch', 'African Grey', 'Macaw', 'Cockatoo', 'Amazon Parrot', 'Pionus', 'Conure', 'Parakeet'
    ],
    Rabbit: [
        'Holland Lop', 'Mini Rex', 'Dutch Rabbit', 'Lionhead', 'English Angora', 'Netherland Dwarf', 'Flemish Giant'
    ]
};

function AddPet() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [petInfo, setPetInfo] = useState({
        name: '',
        category: 'Dog',
        type: 'Adoption',
        breed: '',
        age: '',
        gender: 'Male',
        location: '',
        description: '',
        healthStatus: 'Healthy',
        vaccinated: false,
        price: '',
        paymentDetails: '',
        images: [],
        vaccinations: [],
        medicalHistory: [],
        lat: null,
        lng: null,
    });

    const [isOtherBreed, setIsOtherBreed] = useState(false);
    const [customBreed, setCustomBreed] = useState('');
    const [loading, setLoading] = useState(false);
    const [markerPos, setMarkerPos] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setPetInfo((prev) => {
            const newState = { ...prev, [name]: inputType === 'checkbox' ? checked : value };
            if (name === 'category') {
                newState.breed = '';
                setIsOtherBreed(false);
                setCustomBreed('');
            }
            if (name === 'breed') {
                setIsOtherBreed(value === 'Other');
            }
            return newState;
        });
    };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const pos = { lat, lng };
        setMarkerPos(pos);
        setPetInfo(prev => ({ ...prev, lat, lng }));

        // Free Reverse Geocoding using OpenStreetMap Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.address) {
                    const { city, state_district, city_district, suburb, country } = data.address;
                    const place = city || state_district || city_district || suburb || '';
                    const label = [place, country].filter(Boolean).join(', ');
                    if (label) {
                        setPetInfo(prev => ({ ...prev, location: label }));
                    }
                }
            })
            .catch(err => console.error("Reverse geocoding failed", err));
    };

    const handleHealthUpdate = (field, value) => {
        setPetInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleImagesChange = (files) => {
        Promise.all(files.map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        }))).then(base64Images => {
            setPetInfo(prev => ({ ...prev, images: base64Images }));
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!petInfo.name || !petInfo.breed || !petInfo.location) {
                toast.error("Please fill in all required fields.");
                setLoading(false);
                return;
            }
            const payload = {
                ...petInfo,
                breed: isOtherBreed ? customBreed : petInfo.breed,
                listingType: petInfo.type,
                price: petInfo.type === 'Sale' ? Number(petInfo.price) : 0,
            };
            const response = await api.post('/pets', payload);
            if (response.data.success) {
                toast.success('Pet listing created!');
                navigate(user?.role === 'Owner' ? '/user' : '/ngo');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding pet record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header - EXACT SAME UI */}
                    <div className="bg-gradient-to-r from-[#8D6E63] to-[#5D4037] px-6 py-5 text-white relative">
                        <button onClick={() => navigate(-1)} className="absolute left-6 top-6 text-white hover:text-amber-200 transition-colors flex items-center gap-2 text-sm font-semibold">
                           &larr; Back
                        </button>
                        <h1 className="text-2xl font-bold mt-4">Add a New Pet</h1>
                        <p className="text-amber-100 text-sm mt-1">Fill in the details to create your pet listing</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Listing Type - EXACT SAME UI */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Type *</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Adoption', 'Rehoming', 'Sale'].map(lt => (
                                    <label key={lt} className={`cursor-pointer rounded-xl border-2 p-3 text-center text-sm font-semibold transition-all ${petInfo.type === lt
                                            ? lt === 'Adoption' ? 'border-green-500 bg-green-50 text-green-700'
                                                : lt === 'Rehoming' ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}>
                                        <input type="radio" name="type" value={lt} checked={petInfo.type === lt} onChange={handleChange} className="hidden" />
                                        {lt === 'Adoption' ? '🏠' : lt === 'Rehoming' ? '🔄' : '🛒'} {lt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price & Payment - EXACT SAME UI */}
                        {petInfo.type === 'Sale' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (NPR) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">Rs.</span>
                                        <input type="number" name="price" value={petInfo.price} onChange={handleChange} min="0" placeholder="e.g. 5000"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Instructions</label>
                                    <textarea name="paymentDetails" value={petInfo.paymentDetails} onChange={handleChange} rows="2"
                                        placeholder="e.g. Please transfer to Khalti ID: 98XXXXXXX..."
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63] resize-none" />
                                </div>
                            </div>
                        )}

                        {/* Name - EXACT SAME UI */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pet Name *</label>
                            <input type="text" name="name" value={petInfo.name} onChange={handleChange} required placeholder="e.g. Buddy"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]" />
                        </div>

                        {/* Type + Breed - EXACT SAME UI */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Animal Type</label>
                                <select name="category" value={petInfo.category} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]">
                                    <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Breed *</label>
                                <select name="breed" value={petInfo.breed} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]">
                                    <option value="">Select Breed</option>
                                    {(BREED_LISTS[petInfo.category] || []).map(breed => (
                                        <option key={breed} value={breed}>{breed}</option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                                {isOtherBreed && (
                                    <input type="text" value={customBreed} onChange={(e) => setCustomBreed(e.target.value)}
                                        placeholder="Type custom breed name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63] mt-2" required />
                                )}
                            </div>
                        </div>

                        {/* Age + Gender + Quantity - EXACT SAME UI */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                                <input type="text" name="age" value={petInfo.age} onChange={handleChange} placeholder="e.g. 2 years"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                <select name="gender" value={petInfo.gender} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]">
                                    <option>Male</option><option>Female</option><option>Unknown</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
                                <input type="number" name="quantity" value={petInfo.quantity || 1} onChange={handleChange} min="1" required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]" />
                            </div>
                        </div>

                        {/* Location - EXACT SAME UI (Now using Google Maps) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                <FaMapMarkerAlt className="inline mr-1 text-[#8D6E63]" /> Location *
                            </label>
                            <input type="text" name="location" value={petInfo.location} onChange={handleChange} required placeholder="Click the map below..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63] mb-2" />

                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 text-xs text-amber-800 font-medium flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-amber-600" /> Click on the map to pin the exact location
                                    {markerPos && <span className="ml-auto text-green-700 font-semibold">📍 Pinned</span>}
                                </div>
                                <div style={MAP_DIV_STYLE}>
                                    {!isLoaded ? <div className="h-full flex items-center justify-center bg-gray-50 text-xs">Loading Map...</div> : (
                                        <GoogleMap
                                            mapContainerStyle={MAP_CONTAINER_STYLE}
                                            center={markerPos || MAP_CENTER}
                                            zoom={markerPos ? 14 : 11}
                                            onClick={handleMapClick}
                                        >
                                            {markerPos && <MarkerF position={markerPos} />}
                                        </GoogleMap>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Health + Vaccinated - EXACT SAME UI */}
                        <div className="grid grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Health Status</label>
                                <select name="healthStatus" value={petInfo.healthStatus} onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]">
                                    <option>Healthy</option><option>Needs Care</option><option>Under Treatment</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 pb-1">
                                <input type="checkbox" name="vaccinated" id="vaccinated" checked={petInfo.vaccinated} onChange={handleChange} className="w-4 h-4 accent-[#8D6E63]" />
                                <label htmlFor="vaccinated" className="text-sm font-semibold text-gray-700">Vaccinated</label>
                            </div>
                        </div>

                        {/* Description - EXACT SAME UI */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea name="description" value={petInfo.description} onChange={handleChange} rows="4"
                                placeholder="Tell us more about the pet..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63] resize-none" />
                        </div>

                        {/* Images - EXACT SAME UI */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pet Images</label>
                            <MultiImageUpload onImagesChange={handleImagesChange} maxImages={5} />
                        </div>

                        {/* Health Records - EXACT SAME UI */}
                        <div className="border-t border-gray-100 pt-6">
                            <PetHealthRecord pet={petInfo} isEditable={true} onUpdate={handleHealthUpdate} />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-[#8D6E63] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#5D4037] transition-colors disabled:opacity-60">
                            {loading ? 'Creating listing…' : 'Add Pet Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddPet;
