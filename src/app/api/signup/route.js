import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs"; // allow Node modules

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // put this in .env

// POST: create new user
export async function POST(req) {
    try {
        await dbConnect();

        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new Response(
                JSON.stringify({ message: "User already exists" }),
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" } // valid for 7 days
        );

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
            { status: 201 }
        );

    } catch (error) {
        console.error("Signup error:", error);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500 }
        );
    }
}

// GET: fetch all users
export async function GET(req) {
    try {
        await dbConnect();

        const users = await User.find({}, { password: 0 }); // exclude passwords

        return new Response(JSON.stringify(users), { status: 200 });

    } catch (error) {
        console.error("Fetch users error:", error);
        return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
    }
}

// DELETE: delete a user by email
export async function DELETE(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return new Response(
                JSON.stringify({ message: "Email is required" }),
                { status: 400 }
            );
        }

        const deletedUser = await User.findOneAndDelete({ email });

        if (!deletedUser) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ message: "User deleted successfully" }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete user error:", error);
        return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
    }
}
