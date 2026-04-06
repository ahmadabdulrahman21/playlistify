import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const runtime = "nodejs";

export async function PATCH(req) {
    try {
        await dbConnect();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const { name } = await req.json();
        if (!name) {
            return new Response(JSON.stringify({ message: "Name is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const user = await User.findByIdAndUpdate(decoded.userId, { name }, { new: true });
        if (!user) {
            return new Response(JSON.stringify({ message: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ message: "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
