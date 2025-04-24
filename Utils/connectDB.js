// config/connectDB.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log("DataBase : " + process.env.MONGO_URI)
    console.log("API KEY : " + process.env.GOOGLE_API_KEY)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
