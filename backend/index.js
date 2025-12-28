require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./Routes/AuthRouter');
require('./Models/db');

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Aashrey For Paws Backend is running 🐾');
});

app.use(bodyParser.json());
app.use(cors());
app.use('/auth', authRouter);
app.use('/pets', require('./Routes/PetRouter'));
app.use('/posts', require('./Routes/PostRouter'));
app.use('/contact', require('./Routes/ContactRouter'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
