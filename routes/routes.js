// Import necessary libraries
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const User = require("../models/userModel");
const Message = require("../models/messageModel");

// Import middlewares from separate file
const {
  checkJWTToken,
  ...otherMiddlewares
} = require("../middleware/middleware");

// Define the secretKey for JWT
const secretKey = "ch@tx@4212";

// POST route for user registration
router.post(
  "/register",
  otherMiddlewares.checkUsernameDomain,
  otherMiddlewares.checkContentType,
  async (req, res) => {
    try {
      const { username, password, isAdmin } = req.body;

      console.log("Received registration request:", username);

      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        console.log("User already exists", username);
        return res.status(409).json({ message: "User already exists" });
      }

      // Create a new user with the default role "user" or "admin" based on the checkbox
      const newUser = new User({
        username,
        password,
        role: isAdmin ? "admin" : "user",
      });
      await newUser.save();

      console.log("User registered successfully", username);

      // Generate a JWT token for the new user
      const jwtToken = jwt.sign(
        { username, password, role: newUser.role },
        secretKey,
        {
          expiresIn: "1h",
        }
      );

      res.status(201).json({
        message: "User registered successfully",
        token: jwtToken,
        role: newUser.role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// POST route for user login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials - User not found" });
    }

    // Check if the hashed password matches the stored hashed password
    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (passwordMatch) {
      // Generate a JWT token for the user
      const jwtToken = jwt.sign(
        { username, password, role: user.role },
        secretKey,
        {
          expiresIn: "1h",
        }
      );

      return res.json({ token: jwtToken, role: user.role });
    } else {
      return res
        .status(401)
        .json({ message: "Invalid credentials - Password mismatch" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// POST route for sending a message, protected by JWT authentication
router.post("/messages", checkJWTToken, async (req, res) => {
  try {
    const { text } = req.body;
    const sender = req.username;

    console.log("Received message:", text);
    console.log("Sender:", sender);

    // Create a new message associated with the logged-in user
    const newMessage = new Message({ text, sender });
    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// GET route for retrieving user's messages, protected by JWT authentication
router.get("/messages", checkJWTToken, async (req, res) => {
  try {
    // Retrieve messages based on the logged-in user
    const userMessages = await Message.find(); // { sender: req.username }
    res.json(userMessages);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// DELETE route for deleting a message, protected by JWT authentication
router.delete("/messages/:messageId", checkJWTToken, async (req, res) => {
  try {
    const messageId = req.params.messageId;

    // Find the message and remove it
    const deletedMessage = await Message.findOneAndDelete({
      _id: messageId,
      // sender: req.username,
    });

    if (deletedMessage) {
      res.json({ message: "Message deleted successfully" });
    } else {
      res.status(404).json({ message: "Message not found or unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// POST route for changing user password, protected by JWT authentication
router.post("/password-change", checkJWTToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const username = req.username;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Check if the old password matches the stored hashed password
    const passwordMatch = await bcryptjs.compare(oldPassword, user.password);

    if (passwordMatch) {
      // Hash the new password before saving it
      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      // Update the user's password in the database
      await User.findOneAndUpdate({ username }, { password: hashedPassword });

      return res.status(200).json({ message: "Password changed successfully" });
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized: Incorrect old password" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// POST route for admin login
router.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user is attempting to log in as admin with hardcoded credentials
    if (username === "admin@gmail.com" && password === "admin1234") {
      // Allow login as admin with hardcoded credentials
      const jwtToken = jwt.sign(
        { username, password, role: "admin" },
        secretKey,
        {
          expiresIn: "1h",
        }
      );

      return res.json({ token: jwtToken, role: "admin" });
    } else {
      // Reject login attempts for non-admin users
      return res.status(401).json({
        message: "Invalid credentials - Password mismatch or not an admin",
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
// Admin Routes
// GET route for fetching all users (admin access only)
router.get("/admin/users", checkJWTToken, async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }

    // Fetch all users from the database
    const users = await User.find({}, "username role");

    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// DELETE route for deleting a user (admin access only)
router.delete("/admin/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("Received delete request for user ID:", userId);

  try {
    // Perform deletion logic here (e.g., using Mongoose)
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Export the router and checkJWTToken for use in other parts of the application
module.exports = {
  router: router,
  checkJWTToken: checkJWTToken,
};
