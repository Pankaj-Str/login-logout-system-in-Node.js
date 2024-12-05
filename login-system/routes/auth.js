const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.redirect('/dashboard');
});

// Dashboard Route (Protected)
router.get('/dashboard', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('dashboard');
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
