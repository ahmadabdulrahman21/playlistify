import mongoose from "mongoose"; // Import Mongoose library for MongoDB

// Read the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// If MONGODB_URI is not defined, throw an error
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

// Use a global variable to cache the connection across hot reloads in development
let cached = global.mongoose;

// If cached doesn't exist, initialize it with null values for conn and promise
if (!cached) cached = global.mongoose = { conn: null, promise: null };

// Main function to connect to MongoDB
async function dbConnect() {
    // If a connection already exists, return it immediately
    if (cached.conn) return cached.conn;

    // If no connection is in progress, start one
    if (!cached.promise) {
        // mongoose.connect returns a promise; store it in cached.promise
        // bufferCommands: false disables queuing commands before the connection is ready
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
    }

    // Wait for the connection to complete, then store the connection in cached.conn
    cached.conn = await cached.promise;

    // Return the connected Mongoose instance
    return cached.conn;
}

// Export the dbConnect function so it can be used elsewhere in the app
export default dbConnect;