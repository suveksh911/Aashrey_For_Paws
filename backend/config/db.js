const mongoose = require('mongoose');
const config = require('../config/config');

mongoose.connect(config.mongoUri)
    .then((status) => {
        console.log(`MongoDB connected: ${status.connection.host} | Port: ${status.connection.port}`);
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });



