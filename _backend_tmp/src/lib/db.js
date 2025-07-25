import mongoose from "mongoose";
import 'dotenv/config'; // Load environment variables

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      // console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      // console.error('Mongoose connection error:', err);
    });
    
    // IMPORTANT: For cookies to work in development, run both frontend and backend on the same domain (localhost) and set 'secure: false' for cookies.
    
    return conn;
  } catch (error) {
    // console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};