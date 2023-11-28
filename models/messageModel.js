// Import the Mongoose library
const mongoose = require("mongoose");

// Define the schema for the 'messages' collection
const messageSchema = new mongoose.Schema({
  // Text content of the message, must be present
  text: {
    type: String,
    required: true,
  },
  // Sender of the message, must be present
  sender: {
    type: String,
    required: true,
  },
  // Timestamp of the message, defaults to the current date and time
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a Mongoose model named 'Message' using the defined schema
const Message = mongoose.model("Message", messageSchema);

// Export the 'Message' model for use in other parts of the application
module.exports = Message;
