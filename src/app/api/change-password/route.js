// Import MongoDB connection utility
import dbConnect from "../../../lib/mongodb";

// Import User model
import User from "../../../models/User";

// Import bcrypt to hash/compare passwords
import bcrypt from "bcryptjs";

// Import JWT for authentication
import jwt from "jsonwebtoken";

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Set Node.js runtime
export const runtime = "nodejs";

// ====================
// PATCH: Change user password
// ====================
export async function PATCH(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Get Authorization header from request
        const authHeader = req.headers.get("authorization");

        // Check if header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify JWT
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET); // decoded contains userId, email
        } catch {
            return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Get current and new passwords from request body
        const { currentPassword, newPassword } = await req.json();

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return new Response(
                JSON.stringify({ message: "Both current and new passwords are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Validate new password strength (at least 8 chars, 1 letter, 1 number/special)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[\d\W]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return new Response(
                JSON.stringify({
                    message: "New password must be at least 8 characters long and include at least 1 letter and 1 number or special character",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Find user by ID from token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Compare current password with stored hashed password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Current password is incorrect" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password in database
        user.password = hashedPassword;
        await user.save();

        // Return success message
        return new Response(
            JSON.stringify({ message: "Password updated successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        // Log any errors
        console.error(err);

        // Return server error
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}