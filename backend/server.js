const chalk = require('chalk');
require('dotenv').config({ silent: true });

const config = require('./config/config');
const app = require('./app');
require('./config/db');

const PORT = config.port || 5000;

app.listen(PORT, () => {
    console.log(chalk.cyan(`[0] Server running at http://localhost:${PORT}`));
    console.log(chalk.gray(`[1] Environment: ${config.nodeEnv}`));
});
