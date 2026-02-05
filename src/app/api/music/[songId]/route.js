export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const songId = req.url.split("/").pop(); // get songId from URL

    try {
        const res = await fetch(`https://api.deezer.com/track/${songId}`);
        if (!res.ok) throw new Error("Failed to fetch songs");

        const data = await res.json();

        const song = {
            id: data.id,
            title: data.title,
            artist: data.artist.name,
            image: data.album.cover_medium,
            preview: data.preview, // 30-second audio
        };

        return new Response(JSON.stringify(song), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to load song" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
