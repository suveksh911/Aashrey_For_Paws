const AdoptionModel = require('../models/Adoption');
const PetModel = require('../models/Pet');
const { createNotification, notifyAdmins } = require('./NotificationController');

const createAdoptionRequest = async (req, res) => {
    try {
        const { petId, petName, reason, phone, ownerId, userName } = req.body;
        const userId = req.user._id;

        const pet = await PetModel.findById(petId);
        if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

        const adoptionRequest = new AdoptionModel({
            petId, petName, userId,
            userName: userName || req.user.name,
            ownerId: pet.ownerId,
            reason, phone, status: 'Pending'
        });

        await adoptionRequest.save();

        
        await createNotification(
            pet.ownerId,
            'info',
            `🐶 New adoption request for ${petName} from ${userName || req.user.name}`,
            `/user` 
        );

        // Notify Admins
        await notifyAdmins(
            'info',
            `🐶 New Adoption Inquiry: ${userName || req.user.name} for "${petName}"`,
            `/admin?tab=overview`
        );

        res.status(201).json({ success: true, message: "Adoption request submitted", data: adoptionRequest });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to submit request" });
    }
};

const getMyAdoptionRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await AdoptionModel.find({ userId }).sort({ date: -1 }).populate('petId');
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
};

const getIncomingAdoptionRequests = async (req, res) => {
    try {
       
        const myPets = await PetModel.find({ ownerId: req.user._id }).select('_id');
        const petIds = myPets.map(p => p._id.toString());

        // Find all adoption requests for those pets
        const requests = await AdoptionModel.find({ petId: { $in: petIds } }).sort({ date: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch incoming requests" });
    }
};

const updateAdoptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await AdoptionModel.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

       
        if (request.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this request" });
        }

        request.status = status;
        await request.save();

        
        if (status === 'Approved') {
            const pet = await PetModel.findById(request.petId);
            if (pet) {
                const newQuantity = Math.max(0, (pet.quantity || 1) - 1);
                const updates = { quantity: newQuantity };
                
                
                if (newQuantity === 0) {
                    updates.status = 'Adopted';
                }
                
                await PetModel.findByIdAndUpdate(request.petId, updates);
            }

            await createNotification(
                request.userId,
                'success',
                `🎉 Your adoption request for ${request.petName} has been approved!`,
                `/pet/${request.petId}`
            );
        } else if (status === 'Rejected') {
            await createNotification(
                request.userId,
                'alert',
                `Your adoption request for ${request.petName} was not approved this time.`,
                `/pet/${request.petId}`
            );
        }

        res.status(200).json({ success: true, message: `Request ${status}`, data: request });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};

const deleteAdoptionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await AdoptionModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Request cancelled" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete request" });
    }
};

module.exports = {
    createAdoptionRequest,
    getMyAdoptionRequests,
    getIncomingAdoptionRequests,
    updateAdoptionStatus,
    deleteAdoptionRequest
};




