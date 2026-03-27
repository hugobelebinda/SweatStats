const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  // Link activity to a specific user in DB
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Unique ID from Strava 
  activityId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  type: String, // "Run", "Ride", "WeightTraining"
  distance: Number, // in meters
  moving_time: Number, // in seconds
  start_date: Date,
  
  //string stores the GPS path for later maps
  map_polyline: String, 
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);