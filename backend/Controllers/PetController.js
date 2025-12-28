const PetModel = require("../Models/Pet");

const getAllPets = async (req, res) => {
    try {
        const { type, category } = req.query;
        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;

        const pets = await PetModel.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: pets });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch pets" });
    }
}

const getPetById = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet not found" });
        }
        res.status(200).json({ success: true, data: pet });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch pet details" });
    }
}

const createPet = async (req, res) => {
    try {
        const body = req.body;
        // Ensure images array exists if only image string is provided, or vice versa
        if (!body.images && body.image) {
            body.images = [body.image];
        } else if (body.images && body.images.length > 0 && !body.image) {
            body.image = body.images[0];
        }

        const newPet = new PetModel(body);
        await newPet.save();
        res.status(201).json({ success: true, message: "Pet added successfully", data: newPet });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to create pet record" });
    }
}

module.exports = {
    getAllPets,
    getPetById,
    createPet
}
