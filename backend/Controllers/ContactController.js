const ContactModel = require("../Models/Contact");

const submitContact = async (req, res) => {
    try {
        const body = req.body;
        const newContact = new ContactModel(body);
        await newContact.save();
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
}

module.exports = {
    submitContact
}
