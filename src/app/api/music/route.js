export async function GET() {
    try {
        let allSongs = [];
        const limit = 50; // max per request
        let index = 0;
        let maxFetch = 200; // avoid too many requests
        let fetched = 0;

        while (fetched < maxFetch) {
            const res = await fetch(
                `https://api.deezer.com/chart/0/tracks?index=${index}&limit=${limit}`
            );
            if (!res.ok) throw new Error("Failed to fetch songs");

            const data = await res.json();

            if (!data.data || data.data.length === 0) break; // stop if no more tracks

            const songs = data.data.map(track => ({
                id: track.id,
                title: track.title,
                artist: track.artist.name,
                image: track.album.cover_medium,
                preview: track.preview
            }));

            allSongs = allSongs.concat(songs);

            fetched += data.data.length;
            index += limit;
        }

        return new Response(JSON.stringify(allSongs), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Failed to load songs" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
