import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function DELETE(req) {
    try {
        await dbConnect();

        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ message: "Authorization token required" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return new Response(
                JSON.stringify({ message: "Invalid or expired token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = await req.json();
        const { password } = body;

        if (!password) {
            return new Response(
                JSON.stringify({ message: "Password is required to delete account" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Incorrect password" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        await User.findByIdAndDelete(user._id);

        return new Response(
            JSON.stringify({ message: "Account deleted successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Delete user error:", error);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
