const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/loginSystemDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/', require('./routes/auth'));

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
