// Import database connection utility
import dbConnect from "../../../lib/mongodb";

// Import the User Mongoose model
import User from "../../../models/User";

// Import bcrypt to hash passwords
import bcrypt from "bcryptjs";

// Import JWT to generate authentication tokens
import jwt from "jsonwebtoken";

// Next.js app router runs in Node.js runtime
export const runtime = "nodejs"; // allow Node modules

// Get JWT secret from environment variables or use a default
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // put this in .env

// ====================
// POST: Create new user (Sign up)
// ====================
export async function POST(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Extract name, email, password from request body
        const { name, email, password } = await req.json();

        // Validate input
        if (!name || !email || !password) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new Response(
                JSON.stringify({ message: "User already exists" }),
                { status: 400 }
            );
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate JWT token valid for 7 days
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return success response with token and user info
        return new Response(
            JSON.stringify({
                message: "User created successfully!",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }),
            { status: 201 } // 201 = Created
        );

    } catch (error) {
        // Log server error and return 500
        console.error("Signup error:", error);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500 }
        );
    }
}

// ====================
// GET: Fetch all users (without passwords)
// ====================
export async function GET(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Fetch all users and exclude the password field
        const users = await User.find({}, { password: 0 });

        // Return list of users
        return new Response(JSON.stringify(users), { status: 200 });

    } catch (error) {
        console.error("Fetch users error:", error);
        return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
    }
}

// ====================
// DELETE: Delete a user by email
// ====================
export async function DELETE(req) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Extract query parameters from the URL
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email"); // get ?email=example@example.com

        // Validate email
        if (!email) {
            return new Response(
                JSON.stringify({ message: "Email is required" }),
                { status: 400 }
            );
        }

        // Delete user from DB
        const deletedUser = await User.findOneAndDelete({ email });

        // If user does not exist
        if (!deletedUser) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404 }
            );
        }

        // Success response
        return new Response(
            JSON.stringify({ message: "User deleted successfully" }),
            { status: 200 }
        );

    } catch (error) {
        // Log error and return 500
        console.error("Delete user error:", error);
        return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
    }
}