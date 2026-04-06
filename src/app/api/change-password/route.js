import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const runtime = "nodejs";

export async function PATCH(req) {
    try {
        await dbConnect();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const { currentPassword, newPassword } = await req.json();
        if (!currentPassword || !newPassword) {
            return new Response(
                JSON.stringify({ message: "Both current and new passwords are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Validate new password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[\d\W]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return new Response(
                JSON.stringify({
                    message: "New password must be at least 8 characters long and include at least 1 letter and 1 number or special character",
                }),
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

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Current password is incorrect" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return new Response(
            JSON.stringify({ message: "Password updated successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
