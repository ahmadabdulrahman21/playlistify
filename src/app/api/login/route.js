// Import the function to connect to MongoDB
import dbConnect from "../../../lib/mongodb";

// Import the User model (Mongoose schema)
import User from "../../../models/User";

// Import bcrypt for password hashing and comparison
import bcrypt from "bcryptjs";

// Import JWT for creating tokens
import jwt from "jsonwebtoken";

// Specify that this API runs in Node.js runtime (needed in Next.js app directory)
export const runtime = "nodejs";

// Get the JWT secret from environment variables, or use a default
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Define the POST request handler for login
export async function POST(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Get email and password from the request body (JSON)
        const { email, password } = await req.json();

        // Check if email or password is missing
        if (!email || !password) {
            return new Response(
                JSON.stringify({ message: "Email and password are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Find the user in the database by email
        const user = await User.findOne({ email });

        // If user does not exist, return 404
        if (!user) {
            return new Response(
                JSON.stringify({ message: "User with this email does not exist" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Compare the password from the request with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);

        // If password does not match, return 401
        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Incorrect password" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create a JWT token with user ID and email, valid for 7 days
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return success response with token and user info
        return new Response(
            JSON.stringify({
                message: "Login successful",
                token, // JWT token for authentication
                user: { // User info to send back to frontend
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        // If any error occurs, log it and return 500 server error
        console.error("Login error:", error);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}