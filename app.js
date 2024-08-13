const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/secrets", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define the Schema
const trySchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "thisislittlesecret.";
trySchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

// Define the Model
const Item = mongoose.model('second', trySchema);

// Route to Render Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// Handle Registration Form Submission
app.post("/register", async (req, res) => {
    try {
        const newUser = new Item({
            email: req.body.username,
            password: req.body.password
        });

        await newUser.save();
        res.render("secrets");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Handle Login Form Submission
app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await Item.findOne({ email: username });

        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.status(401).send("Unauthorized: Password incorrect");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to Render Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Route to Render Registration Page
app.get('/register', (req, res) => {
    res.render('register');
});

// Route to Render Submit Page
app.get('/submit', (req, res) => {
    res.render('submit');
});

app.get('/logout', (req, res) => {
    res.redirect('/'); // Redirect to the home page
});


// Handle form submission on the /submit route
app.post('/submit', (req, res) => {
    const submittedSecret = req.body.secret;
    console.log(submittedSecret);
    // Process the secret or save it to the database
    res.render('secrets'); // Or redirect to a success page
});

// Test Route
app.get('/test', (req, res) => {
    res.send('Server is working!');
});




// Start the Server
app.listen(5000, () => {
    console.log('Server started on port 4000');
});
