import mongoose from "mongoose"; // Import Mongoose library to define schemas and models

// Define a new Mongoose schema for the User collection
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name is a string and is required
    email: { type: String, required: true, unique: true }, // Email is required and must be unique
    password: { type: String, required: true }, // Password is required
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Role can only be "user" or "admin"; defaults to "user" if not provided
}, { timestamps: true });
// timestamps: true automatically adds `createdAt` and `updatedAt` fields

// Export the User model
// If the model already exists (e.g., hot reload in Next.js), use it;
// otherwise, create a new model named "User" using UserSchema
export default mongoose.models.User || mongoose.model("User", UserSchema);