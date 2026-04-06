// GET request handler to fetch a single song by ID
export async function GET(req) {
    // Parse the request URL
    const { searchParams } = new URL(req.url);

    // Extract the songId from the URL (last part of the path)
    const songId = req.url.split("/").pop();

    try {
        // Fetch song data from Deezer API using the songId
        const res = await fetch(`https://api.deezer.com/track/${songId}`);

        // If the response is not OK, throw an error
        if (!res.ok) throw new Error("Failed to fetch songs");

        // Parse the JSON response from Deezer API
        const data = await res.json();

        // Map the Deezer response to a simplified song object
        const song = {
            id: data.id,                     // song ID
            title: data.title,               // song title
            artist: data.artist.name,        // artist name
            image: data.album.cover_medium,  // album cover image
            preview: data.preview,           // 30-second preview audio URL
        };

        // Return the song as a JSON response
        return new Response(JSON.stringify(song), {
            status: 200,                      // HTTP 200 OK
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        // If any error occurs, return 500 server error
        return new Response(
            JSON.stringify({ error: "Failed to load song" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}