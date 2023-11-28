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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
