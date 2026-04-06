// Import MongoDB connection utility
import dbConnect from "../../../lib/mongodb";

// Import User Mongoose model
import User from "../../../models/User";

// Import JWT for authentication
import jwt from "jsonwebtoken";

// Get JWT secret from environment variables (or fallback)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// This API runs in Node.js runtime
export const runtime = "nodejs";

// ====================
// PATCH: Update user profile (name)
// ====================
export async function PATCH(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Get the "Authorization" header from request
        const authHeader = req.headers.get("authorization");

        // Check if header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Extract token from header (Bearer TOKEN)
        const token = authHeader.split(" ")[1];

        // Decode and verify the JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET); // decoded will have userId, email
        } catch (err) {
            // Invalid or expired token
            return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Get the new name from request body
        const { name } = await req.json();

        // Validate input
        if (!name) {
            return new Response(
                JSON.stringify({ message: "Name is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Update user in database by ID from token, return the new document
        const user = await User.findByIdAndUpdate(decoded.userId, { name }, { new: true });

        // If user not found
        if (!user) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Return success response with updated user info
        return new Response(
            JSON.stringify({
                message: "Profile updated successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                }
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        // Log server errors
        console.error(err);

        // Return 500 Internal Server Error
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}