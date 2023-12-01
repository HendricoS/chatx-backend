// Import necessary libraries
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

// Define the schema for the 'users' collection
const userSchema = new mongoose.Schema({
  // Unique username required for each user
  username: { type: String, unique: true, required: true },
  // Password required for each user
  password: { type: String, required: true },
  // User role, can be 'user' or 'admin', default is 'user'
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// Middleware: Hash the password before saving it to the database
userSchema.pre("save", async function (next) {
  // 'this' refers to the current user instance
  const user = this;

  // Check if the password field is modified before hashing
  if (user.isModified("password")) {
    // Hash the password using bcrypt with a cost factor of 10
    user.password = await bcryptjs.hash(user.password, 10);
  }

  // Continue to the next middleware or save operation
  next();
});

// Create a Mongoose model named 'User' using the defined schema
const User = mongoose.model("User", userSchema);

// Export the 'User' model for use in other parts of the application
module.exports = User;
