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
        res.status(500).json({ success: false, message: "Failed to fetch pets" });
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
            } : null
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

        const newPet = new PetModel({
            ...body,
            images: processedImages,
            image: processedImages[0] || body.image,
            ownerId: req.user._id,
            owner: req.user.name || body.owner,
            isApproved: (req.user.role !== 'NGO' || body.type === 'Lost' || body.type === 'Found')
        });
        await newPet.save();

       
        await createNotification(
            req.user._id,
            'success',
            `🐾 Your pet "${body.name}" has been successfully added! ${newPet.isApproved ? '' : 'It will be visible after admin approval.'}`,
            `/user`
        );

        res.status(201).json({ success: true, message: "Pet added successfully", data: newPet });
    } catch (err) {
        console.error('createPet error:', err.message, err.errors || '');
        res.status(500).json({ success: false, message: err.message || "Failed to create pet record" });
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

        const { name, breed, age, gender, location, description, status, adoptionStatus, healthStatus, images, image, type, category, price, paymentDetails, vaccinations, medicalHistory } = req.body;
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
        if (vaccinations !== undefined) updates.vaccinations = vaccinations;
        if (medicalHistory !== undefined) updates.medicalHistory = medicalHistory;
    if (req.body.quantity !== undefined) updates.quantity = req.body.quantity;

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

        
        await createNotification(
            req.user._id,
            'info',
            `📝 Details for "${updated.name}" have been updated.`,
            `/pet/${id}`
        );

        res.status(200).json({ success: true, message: 'Pet updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update pet' });
    }
}

const deletePet = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
        if (pet.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this pet' });
        }
        await PetModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Pet removed successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete pet" });
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
        const pet = await PetModel.findByIdAndDelete(id);
        
        // Log for admin
        if (pet) {
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



