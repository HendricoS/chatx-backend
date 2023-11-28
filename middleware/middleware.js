// Import necessary libraries and modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Secret key for JWT
const secretKey = "ch@tx@4212";

// Middleware to check JWT token for authentication
function checkJWTToken(req, res, next) {
  // Extract token from Authorization header
  const token = req.header("Authorization");
  console.log("Received Token:", token); // Debugging

  // Check if the request path is for registration, login, or admin-login
  if (
    req.path === "/register" ||
    req.path === "/login" ||
    req.path === "/admin-login"
  ) {
    // Skip token verification and proceed with registration logic
    return next();
  }

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token.split(" ")[1], secretKey);
    console.log("Decoded Token:", decoded); // Log the decoded token
    req.decodedToken = decoded;
    req.username = decoded.username; // Add username to the request object

    // Check if the role is "admin"
    if (decoded.role === "admin") {
      req.isAdmin = true;
    } else {
      req.isAdmin = false;
    }

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

// Middleware to verify and change the user's password
async function changePasswordVerification(req, res, next) {
  try {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    // Find the user by username
    const user = await User.findOne({ username: req.username });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Check if the old password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (passwordMatch) {
      // Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      await User.findOneAndUpdate(
        { username: req.username },
        { password: hashedPassword }
      );

      // Continue to the next middleware or route
      next();
    } else {
      res.status(401).json({ message: "Unauthorized: Incorrect old password" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Middleware to check if the username has a valid domain
function checkUsernameDomain(req, res, next) {
  if (req.body.username.endsWith("@gmail.com")) {
    next();
  } else {
    res.status(400).json({ message: "Bad Request: Invalid username domain" });
  }
}

// Middleware to check the length of the task title
function checkTaskLength(req, res, next) {
  if (req.body.title.length <= 140) {
    next();
  } else {
    res.status(400).json({ message: "Bad Request: Task title too long" });
  }
}

// Middleware to check the content type of the request
function checkContentType(req, res, next) {
  if (req.get("Content-Type") === "application/json") {
    next();
  } else {
    res.status(400).json({ message: "Bad Request: Invalid content type" });
  }
}

// Object containing all the middlewares
const otherMiddlewares = {
  checkJWTToken,
  changePasswordVerification,
  checkUsernameDomain,
  checkContentType,
};

// Export the middlewares
module.exports = {
  ...otherMiddlewares,
  otherMiddlewares,
};
