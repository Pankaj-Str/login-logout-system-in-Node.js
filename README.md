#  **login and logout system using Node.js**:

---

### **1. Set Up the Project**

1. **Initialize the Project**:
   ```bash
   mkdir login-logout-system
   cd login-logout-system
   npm init -y
   ```
   This will create a `package.json` file.

2. **Install Dependencies**:
   ```bash
   npm install express body-parser bcryptjs express-session connect-flash ejs
   ```
   - **express**: Web framework.
   - **body-parser**: Parses request bodies.
   - **bcryptjs**: Hash passwords for security.
   - **express-session**: Manages sessions.
   - **connect-flash**: Displays flash messages.
   - **ejs**: Template engine for rendering views.

3. **Create a Basic Project Structure**:
   ```
   login-logout-system/
   ├── views/
   │   ├── login.ejs
   │   ├── register.ejs
   │   └── dashboard.ejs
   ├── public/
   │   └── css/
   ├── app.js
   └── package.json
   ```

---

### **2. Build the Backend**

1. **Set Up Express App (`app.js`)**:
   ```javascript
   const express = require('express');
   const bodyParser = require('body-parser');
   const bcrypt = require('bcryptjs');
   const session = require('express-session');
   const flash = require('connect-flash');

   const app = express();

   // Middleware
   app.use(bodyParser.urlencoded({ extended: false }));
   app.use(express.static('public'));
   app.set('view engine', 'ejs');
   app.use(
       session({
           secret: 'secret',
           resave: true,
           saveUninitialized: true,
       })
   );
   app.use(flash());

   // Global Variables for Flash Messages
   app.use((req, res, next) => {
       res.locals.success_msg = req.flash('success_msg');
       res.locals.error_msg = req.flash('error_msg');
       next();
   });

   const PORT = 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

2. **Create Dummy Data for Users**:
   (For simplicity, we'll use an in-memory object. In production, use a database.)
   ```javascript
   let users = [];
   ```

---

### **3. Create Routes**

1. **Registration Route**:
   ```javascript
   app.get('/register', (req, res) => {
       res.render('register');
   });

   app.post('/register', async (req, res) => {
       const { username, password, confirmPassword } = req.body;

       if (password !== confirmPassword) {
           req.flash('error_msg', 'Passwords do not match');
           return res.redirect('/register');
       }

       // Hash password
       const hashedPassword = await bcrypt.hash(password, 10);
       users.push({ username, password: hashedPassword });

       req.flash('success_msg', 'You are now registered');
       res.redirect('/login');
   });
   ```

2. **Login Route**:
   ```javascript
   app.get('/login', (req, res) => {
       res.render('login');
   });

   app.post('/login', async (req, res) => {
       const { username, password } = req.body;

       const user = users.find(u => u.username === username);
       if (!user) {
           req.flash('error_msg', 'User does not exist');
           return res.redirect('/login');
       }

       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) {
           req.flash('error_msg', 'Invalid credentials');
           return res.redirect('/login');
       }

       req.session.isAuthenticated = true;
       req.flash('success_msg', 'Logged in successfully');
       res.redirect('/dashboard');
   });
   ```

3. **Dashboard Route (Protected)**:
   ```javascript
   const isAuthenticated = (req, res, next) => {
       if (req.session.isAuthenticated) return next();
       req.flash('error_msg', 'Please log in to view this page');
       res.redirect('/login');
   };

   app.get('/dashboard', isAuthenticated, (req, res) => {
       res.render('dashboard');
   });
   ```

4. **Logout Route**:
   ```javascript
   app.get('/logout', (req, res) => {
       req.session.destroy(err => {
           if (err) throw err;
           res.redirect('/login');
       });
   });
   ```

---

### **4. Create Views**

1. **Register (`views/register.ejs`)**:
   ```html
   <form action="/register" method="POST">
       <input type="text" name="username" placeholder="Username" required />
       <input type="password" name="password" placeholder="Password" required />
       <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
       <button type="submit">Register</button>
   </form>
   ```

2. **Login (`views/login.ejs`)**:
   ```html
   <form action="/login" method="POST">
       <input type="text" name="username" placeholder="Username" required />
       <input type="password" name="password" placeholder="Password" required />
       <button type="submit">Login</button>
   </form>
   ```

3. **Dashboard (`views/dashboard.ejs`)**:
   ```html
   <h1>Welcome to the Dashboard!</h1>
   <a href="/logout">Logout</a>
   ```

---

### **5. Test the Application**

1. Run the app:
   ```bash
   node app.js
   ```

2. Open your browser and navigate to:
   - **Register**: `http://localhost:3000/register`
   - **Login**: `http://localhost:3000/login`
   - **Dashboard**: `http://localhost:3000/dashboard` (accessible only after login).

---

This system demonstrates a basic authentication workflow with session-based login and logout. You can enhance it by integrating a database (e.g., MongoDB) and adding advanced features like JWT authentication, user roles, and account management.