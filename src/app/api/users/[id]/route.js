import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        await dbConnect();

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: "Error deleting user" }), { status: 500 });
    }
}
