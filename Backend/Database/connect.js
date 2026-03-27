const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // You will need to add MONGO_URI to your .env file later
    const conn = await mongoose.connect(process.env.MONGO_URI); 
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;