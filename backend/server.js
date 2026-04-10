require('dotenv').config();
const config = require('./config/config');
const app = require('./app');
require('./config/db');

const PORT = config.port || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${config.nodeEnv})`);
});


