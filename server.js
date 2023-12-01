// Import necessary libraries and modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { checkJWTToken, router } = require("./routes/routes"); // Importing JWT middleware and router
const helmet = require("helmet");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(
  cors({
    origin: [
      "https://chatx-frontend.onrender.com", // Render app domain
      "http://localhost:3000", // Local host domain
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(helmet()); // Use Helmet to enhance application security

// MongoDB Connection
mongoose.connect(
  "mongodb+srv://hendrico:H3ndr1c04212@chatxcluster.w0jizzl.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to Express!");
});

// Routes setup
// Middleware checkJWTToken is applied to all routes defined in the router
app.use("/", checkJWTToken, router);

// Registration route
app.post("/register", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin, // Add isAdmin field to the user model
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      { username, isAdmin }, // Include isAdmin in the token payload
      secretKey,
      { expiresIn: "1h" }
    );

    // Respond with success and the token
    res.json({ message: "Registration successful", token });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
