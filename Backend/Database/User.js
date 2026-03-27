const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  //ID from Strava
  stravaId: {
    type: String,
    required: true,
    unique: true,
  },
  // Basic Info
  firstName: String,
  lastName: String,
  profilePic: String,

  // TOKENS 
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  // 
  expiresAt: {
    type: Number,
    required: true,
  },
  
  // Timestamps adds 'createdAt' and 'updatedAt' automatically
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);