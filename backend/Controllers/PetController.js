const PetModel = require('../models/Pet');
const HealthRecordModel = require('../models/HealthRecord');
const { uploadBase64Image } = require('../utils/cloudinary');
const { createNotification } = require('./NotificationController');

const getAllPets = async (req, res) => {
    try {
        const { type, category, isApproved, postedBy } = req.query;
        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (postedBy) filter.ownerId = postedBy;
        
        if (isApproved === 'false') {
            filter.isApproved = false;
        } else if (isApproved === 'true') {
            filter.isApproved = true;
        } else if (isApproved === 'all') {
        
        } else {
            
            filter.isApproved = true;
            filter.status = { $nin: ['Adopted', 'Reunited'] };
        }

       
        const pets = await PetModel.find(filter)
            .populate('ownerId', 'name role email phone ngoStatus avgRating reviewCount')
            .sort({ createdAt: -1 });

        
        const data = await Promise.all(pets.map(async pet => {
            const petObj = pet.toObject();
            let avgRating = pet.ownerId.avgRating || 0;
            let reviewCount = pet.ownerId.reviewCount || 0;

            
            if (reviewCount === 0 && pet.ownerId._id) {
                const ReviewModel = require('../models/Review');
                const reviews = await ReviewModel.find({ ngoId: pet.ownerId._id });
                if (reviews.length > 0) {
                    reviewCount = reviews.length;
                    avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
                }
            }

            return {
                ...petObj,
                ngoVerified: pet.ownerId && pet.ownerId.ngoStatus === 'verified',
                postedBy: pet.ownerId ? {
                    id: pet.ownerId._id,
                    name: pet.ownerId.name || pet.owner,
                    type: pet.ownerId.role || 'Owner',
                    email: pet.ownerId.email,
                    phone: pet.ownerId.phone,
                    avgRating,
                    reviewCount
                } : null
            };
        }));

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not load pet listings" });
    }
}

const getPetById = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id).populate('ownerId', 'name role email phone ngoStatus');
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found" });
        }

        let avgRating = pet.ownerId.avgRating || 0;
        let reviewCount = pet.ownerId.reviewCount || 0;

        
        if (reviewCount === 0 && pet.ownerId?._id) {
            const ReviewModel = require('../models/Review');
            const reviews = await ReviewModel.find({ ngoId: pet.ownerId._id });
            if (reviews.length > 0) {
                reviewCount = reviews.length;
                avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
            }
        }

        const records = await HealthRecordModel.find({ petId: id }).sort({ date: -1 });
        
        const data = {
            ...pet.toObject(),
            ngoVerified: pet.ownerId && pet.ownerId.ngoStatus === 'verified',
            postedBy: pet.ownerId ? {
                id: pet.ownerId._id,
                name: pet.ownerId.name || pet.owner,
                type: pet.ownerId.role || 'Owner',
                email: pet.ownerId.email,
                phone: pet.ownerId.phone,
                avgRating,
                reviewCount
            } : null,
            // Merge health records back into the response for consistency
            vaccinations: records.filter(r => r.recordType === 'Vaccination').map(v => ({
                id: v._id,
                name: v.description, // Mapped to name for frontend legacy support
                date: v.date,
                nextDue: v.nextDueDate
            })),
            medicalHistory: records.filter(r => r.recordType !== 'Vaccination').map(m => ({
                id: m._id,
                condition: m.description, // Mapped to condition
                date: m.date
            }))
        };

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch pet details" });
    }
}

const createPet = async (req, res) => {
    try {
        const body = req.body;

        
        let processedImages = body.images || [];
        if (processedImages.length > 0) {
            processedImages = await Promise.all(
                processedImages.map(async (img) => {
                    try {
                        return await uploadBase64Image(img, 'aashrey_pets');
                    } catch (uploadErr) {
                        console.warn('Image upload failed, using original:', uploadErr.message);
                        return img; 
                    }
                })
            );
        }

        const { vaccinations, medicalHistory, ...petData } = body;

        const newPet = new PetModel({
            ...petData,
            images: processedImages,
            image: processedImages[0] || body.image,
            ownerId: req.user._id,
            owner: req.user.name || body.owner,
            isApproved: (req.user.role !== 'NGO' || body.type === 'Lost' || body.type === 'Found')
        });
        await newPet.save();

        // Save Health Records if provided
        if (vaccinations && vaccinations.length > 0) {
            const records = vaccinations.map(v => ({
                petId: newPet._id,
                recordType: 'Vaccination',
                date: v.date || new Date().toISOString().split('T')[0],
                description: v.name || 'Vaccination Entry',
                nextDueDate: v.nextDue || ''
            }));
            await HealthRecordModel.insertMany(records);
        }

        if (medicalHistory && medicalHistory.length > 0) {
            const records = medicalHistory.map(m => ({
                petId: newPet._id,
                recordType: 'Treatment',
                date: m.date || new Date().toISOString().split('T')[0],
                description: m.condition + (m.notes ? `: ${m.notes}` : '') || 'Medical History Entry'
            }));
            await HealthRecordModel.insertMany(records);
        }

        await createNotification(
            req.user._id,
            'success',
            `🐾 Your pet "${body.name}" has been successfully added! ${newPet.isApproved ? '' : 'It will be visible after admin approval.'}`,
            `/user`
        );

        res.status(201).json({ success: true, message: "Pet added successfully", data: newPet });
    } catch (err) {
        console.log('Error creating pet:', err.message);
        res.status(500).json({ success: false, message: "Something went wrong while saving the pet record" });
    }
}

const getMyPets = async (req, res) => {
    try {
        const userId = req.user._id;
        const pets = await PetModel.find({ ownerId: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: pets });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch your pets" });
    }
}

const updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

        // Only the owner or admin can update
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this pet' });
        }

        const { name, breed, age, gender, location, description, status, adoptionStatus, healthStatus, images, image, type, category, price, paymentDetails, vaccinations, medicalHistory, quantity } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (breed) updates.breed = breed;
        if (age) updates.age = age;
        if (gender) updates.gender = gender;
        if (location) updates.location = location;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;
        if (healthStatus) updates.healthStatus = healthStatus;
        if (type) updates.type = type;
        if (category) updates.category = category;
        if (price !== undefined) updates.price = price;
        if (paymentDetails !== undefined) updates.paymentDetails = paymentDetails;
        if (quantity !== undefined) updates.quantity = quantity;

        if (images) {
            updates.images = await Promise.all(
                images.map(img => uploadBase64Image(img, 'aashrey_pets'))
            );
            if (updates.images.length > 0) {
                updates.image = updates.images[0];
            }
        } else if (image) {
            updates.image = await uploadBase64Image(image, 'aashrey_pets');
        }

        const updated = await PetModel.findByIdAndUpdate(id, updates, { new: true });

        // Handle Health Records sync if provided
        if (vaccinations !== undefined || medicalHistory !== undefined) {
            // Delete existing records to sync state
            await HealthRecordModel.deleteMany({ petId: id });

            const newRecords = [];
            if (vaccinations && Array.isArray(vaccinations)) {
                vaccinations.forEach(v => {
                    newRecords.push({
                        petId: id,
                        recordType: 'Vaccination',
                        date: v.date || new Date().toISOString().split('T')[0],
                        description: v.name || 'Vaccination Entry',
                        nextDueDate: v.nextDue || ''
                    });
                });
            }
            if (medicalHistory && Array.isArray(medicalHistory)) {
                medicalHistory.forEach(m => {
                    newRecords.push({
                        petId: id,
                        recordType: 'Treatment',
                        date: m.date || new Date().toISOString().split('T')[0],
                        description: m.condition + (m.notes ? `: ${m.notes}` : '') || 'Medical History Entry'
                    });
                });
            }

            if (newRecords.length > 0) {
                await HealthRecordModel.insertMany(newRecords);
            }
        }

        await createNotification(
            req.user._id,
            'info',
            `📝 Details for "${updated.name}" have been updated.`,
            `/pet/${id}`
        );

        res.status(200).json({ success: true, message: 'Pet updated', data: updated });
    } catch (err) {
        console.log('Update error:', err);
        res.status(500).json({ success: false, message: 'There was a problem updating the pet details' });
    }
}

const deletePet = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
        
        const isAdmin = req.user.role === 'Admin';
        if (pet.ownerId.toString() !== req.user._id.toString() && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this pet' });
        }
        
        const reason = req.body.reason || req.query.reason;
        
        await PetModel.findByIdAndDelete(id);
        
        // Notify user if Admin is deleting their pet
        if (isAdmin && pet.ownerId.toString() !== req.user._id.toString()) {
            const message = reason
                ? `⚠️ Your pet listing for "${pet.name}" was removed by an Administrator. Reason: ${reason}`
                : `⚠️ Your pet listing for "${pet.name}" was removed by an Administrator.`;
            await createNotification(pet.ownerId, 'alert', message, '#');
        }

        res.status(200).json({ success: true, message: "Pet removed successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting the pet" });
    }
}

const approvePet = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findByIdAndUpdate(id, { isApproved: true });
        
        // Notify the owner
        if (pet) {
            await createNotification(
                pet.ownerId,
                'success',
                `✨ Your pet profile for "${pet.name}" has been approved and is now live!`,
                `/pet/${id}`
            );
            // Log for admin
            await createNotification(req.user._id, 'success', `Pet Listing Approved: ${pet.name}`);
        }

        res.status(200).json({ success: true, message: "Pet approved successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to approve pet" });
    }
}

const rejectPet = async (req, res) => {
    try {
        const { id } = req.params;
        const reason = req.body.reason || req.query.reason;
        const pet = await PetModel.findByIdAndDelete(id);
        
        if (pet) {
            // Notify the user who posted the pet
            const message = reason 
                ? `❌ Your pending pet listing for "${pet.name}" was rejected. Reason: ${reason}`
                : `❌ Your pending pet listing for "${pet.name}" was rejected.`;
            await createNotification(pet.ownerId, 'alert', message, '#');
            
            // Log for admin
            await createNotification(req.user._id, 'alert', `Pet Listing Rejected: ${pet.name}`);
        }

        res.status(200).json({ success: true, message: "Pet rejected successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to reject pet" });
    }
}


const getHealthRecords = async (req, res) => {
    try {
        const { id } = req.params;
        const records = await HealthRecordModel.find({ petId: id }).sort({ date: -1 });
        
        
        const formattedRecords = records.map(r => ({
            id: r._id.toString(),
            recordType: r.recordType,
            date: r.date,
            description: r.description,
            nextDueDate: r.nextDueDate
        }));

        res.status(200).json({ success: true, data: formattedRecords });
    } catch (error) {
        console.error("Health Records Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const addHealthRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { recordType, date, description, nextDueDate } = req.body;
        const userId = req.user._id;

        const pet = await PetModel.findById(id);
        if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

        if (pet.ownerId.toString() !== userId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: "Unauthorized to add medical records" });
        }

        const newRecord = new HealthRecordModel({
            petId: id,
            recordType, date, description, nextDueDate
        });

        await newRecord.save();

        
        await createNotification(
            userId,
            'info',
            `🏥 New health record (${recordType}) added for ${pet.name}.`,
            `/user?tab=vaccines`
        );

        res.status(201).json({ success: true, message: "Health record added", data: { id: newRecord._id, ...newRecord._doc } });
    } catch (error) {
        console.error("Health Records Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteHealthRecord = async (req, res) => {
    try {
        const { id, recordId } = req.params;
        const userId = req.user._id;

        const pet = await PetModel.findById(id);
        if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

        if (pet.ownerId.toString() !== userId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: "Unauthorized to delete medical records" });
        }

        await HealthRecordModel.findByIdAndDelete(recordId);
        res.status(200).json({ success: true, message: "Health record deleted" });
    } catch (error) {
        console.error("Health Records Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    getAllPets,
    getPetById,
    createPet,
    getMyPets,
    updatePet,
    deletePet,
    approvePet,
    rejectPet,
    getHealthRecords,
    addHealthRecord,
    deleteHealthRecord
}



