# login/logout system in Node.js

Creating a login/logout system in Node.js involves using essential libraries like **Express**, **bcryptjs** (for password hashing), and **Express-Session** or **JWT** (for session or token management). Below is a step-by-step guide to build a simple login/logout system using Node.js.

---

### Step 1: Initialize the Project
1. **Create a new project**:
   ```bash
   mkdir login-system
   cd login-system
   npm init -y
   ```
2. **Install dependencies**:
   ```bash
   npm install express body-parser bcryptjs express-session ejs mongoose
   ```

---

### Step 2: Set Up the Project Structure
Create the following structure:
```
login-system/
│
├── server.js
├── models/
│   └── User.js
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   └── dashboard.ejs
└── public/
    └── styles.css
```

---

### Step 3: Set Up the Server
Create the `server.js` file to handle the Express server.

```javascript
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
```

---

### Step 4: Create the User Model
Create a `models/User.js` file for storing user data.

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
```

---

### Step 5: Create Authentication Routes
Create a `routes/auth.js` file for login, register, and logout routes.

```javascript
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
```

---

### Step 6: Create Views
Create `views/register.ejs`, `views/login.ejs`, and `views/dashboard.ejs`.

#### register.ejs:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
</head>
<body>
    <h1>Register</h1>
    <form action="/register" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Register</button>
    </form>
    <a href="/login">Already have an account? Login</a>
</body>
</html>
```

#### login.ejs:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <h1>Login</h1>
    <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>
    <a href="/register">Don't have an account? Register</a>
</body>
</html>
```

#### dashboard.ejs:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    <h1>Welcome to the Dashboard</h1>
    <a href="/logout">Logout</a>
</body>
</html>
```

---

### Step 7: Test the Application
1. Run the server:
   ```bash
   node server.js
   ```
2. Open a browser and visit:
   - **Register:** [http://localhost:3000/register](http://localhost:3000/register)
   - **Login:** [http://localhost:3000/login](http://localhost:3000/login)
   - **Dashboard:** After login.

---

### Next Steps:
1. **Validation:** Add input validation for username and password.
2. **Security:** Store the session secret securely (use environment variables).
3. **Frontend:** Add styling using CSS or a framework like Bootstrap.
4. **Production:** Use HTTPS and secure cookies in production.

