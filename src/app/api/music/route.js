// GET request handler to fetch multiple songs from Deezer charts
export async function GET() {
    try {
        // Array to store all songs
        let allSongs = [];

        // Maximum number of songs per API request
        const limit = 50;

        // Start index for pagination
        let index = 0;

        // Maximum number of songs to fetch in total
        let maxFetch = 200; // avoid too many requests

        // Counter for how many songs have been fetched
        let fetched = 0;

        // Loop to fetch multiple pages of songs until maxFetch is reached
        while (fetched < maxFetch) {
            // Call Deezer chart API with pagination
            const res = await fetch(
                `https://api.deezer.com/chart/0/tracks?index=${index}&limit=${limit}`
            );

            // If request fails, throw an error
            if (!res.ok) throw new Error("Failed to fetch songs");

            // Parse JSON response
            const data = await res.json();

            // If no more tracks, exit loop
            if (!data.data || data.data.length === 0) break;

            // Map Deezer API tracks to simplified song objects
            const songs = data.data.map(track => ({
                id: track.id,                   // track ID
                title: track.title,             // track title
                artist: track.artist.name,      // artist name
                image: track.album.cover_medium,// album cover image
                preview: track.preview          // 30-second audio preview
            }));

            // Add these songs to the allSongs array
            allSongs = allSongs.concat(songs);

            // Update counters for next page
            fetched += data.data.length;
            index += limit;
        }

        // Return all fetched songs as JSON
        return new Response(JSON.stringify(allSongs), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        // Log any errors and return server error
        console.error(err);
        return new Response(JSON.stringify({ error: "Failed to load songs" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}