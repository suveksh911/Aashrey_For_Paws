const mongoose = require('mongoose');
const config = require('../config/config');
const chalk = require('chalk');

mongoose.connect(config.mongoUri)
    .then((status) => {
        console.log(chalk.green(`[0] Database connected successfully 🐾`));
    })
    .catch((err) => {
        console.error(chalk.red("Error connecting to MongoDB:"), err);
    });
