// Import MongoDB connection utility
import dbConnect from "../../../lib/mongodb";

// Import User model
import User from "../../../models/User";

// Import bcrypt to compare passwords
import bcrypt from "bcryptjs";

// Import JWT for authentication
import jwt from "jsonwebtoken";

// Set Node.js runtime
export const runtime = "nodejs";

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ====================
// DELETE: Delete user account
// ====================
export async function DELETE(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Get Authorization header from request
        const authHeader = req.headers.get("authorization");

        // Check if Authorization header exists
        if (!authHeader) {
            return new Response(
                JSON.stringify({ message: "Authorization token required" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Extract token from header (Bearer TOKEN)
        const token = authHeader.split(" ")[1];
        if (!token) {
            return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Verify and decode JWT
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET); // decoded contains userId, email
        } catch (err) {
            return new Response(
                JSON.stringify({ message: "Invalid or expired token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Get password from request body
        const body = await req.json();
        const { password } = body;

        // Validate password input
        if (!password) {
            return new Response(
                JSON.stringify({ message: "Password is required to delete account" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Find user in database by ID from token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Incorrect password" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Delete user from database
        await User.findByIdAndDelete(user._id);

        // Return success response
        return new Response(
            JSON.stringify({ message: "Account deleted successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        // Log server errors
        console.error("Delete user error:", error);

        // Return server error
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}