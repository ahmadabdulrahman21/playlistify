import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function POST(req) {
    try {
        await dbConnect();

        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({ message: "Email and password are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            // User not found
            return new Response(
                JSON.stringify({ message: "User with this email does not exist" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Password incorrect
            return new Response(
                JSON.stringify({ message: "Incorrect password" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return new Response(
            JSON.stringify({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Login error:", error);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
