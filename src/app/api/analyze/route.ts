import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { song, artist } = await req.json();
    
    // 1. FIRST: Fetch the VERIFIED track from iTunes to prevent AI hallucinations
    let verifiedTitle = song;
    let verifiedArtist = artist || "";
    let originalTrackCover = null;
    let originalTrackPreview = null;

    try {
      const query = encodeURIComponent(`${song} ${artist || ''}`);
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const itunesData = await itunesRes.json();

      if (itunesData.results.length > 0) {
        const track = itunesData.results[0];
        verifiedTitle = track.trackName;
        verifiedArtist = track.artistName; // We grab the official Apple Music artist name!
        originalTrackCover = track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
        originalTrackPreview = track.previewUrl; 
      }
    } catch (e) {
      console.error("iTunes fetch error for original track", e);
    }

    // 2. SECOND: Feed the official, verified data to Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Analyze the song "${verifiedTitle}" ${verifiedArtist ? `by ${verifiedArtist}` : ''}.
    Provide a JSON response with exactly these keys: 
    "genre" (string), 
    "category" (string), 
    "mood" (string), 
    "lyricalEssence" (string, a highly poetic, 1-sentence summary of the song's emotional core or message),
    "story" (string, a captivating 2-sentence editorial description of the track's deeper vibe, meaning, or production style. You MUST accurately attribute the song to ${verifiedArtist || 'the artist'}),
    "themes" (array of 3 to 4 short strings, musical or lyrical themes like "Heavy Bass", "Heartbreak", "Late Night", etc.),
    "hexColor" (string, a hex color code representing the vibe), 
    "recommendations" (array of 3 strings, formatted EXACTLY as "Song Name by Artist Name").`;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    
    // Attach the verified track to the final data payload
    data.searchedTrack = {
      title: verifiedTitle,
      artist: verifiedArtist || "Unknown",
      coverUrl: originalTrackCover,
      previewUrl: originalTrackPreview
    };

    // 3. Fetch recommendations from iTunes
    const enrichedRecommendations = await Promise.all(
      data.recommendations.map(async (rec: string) => {
        try {
          const [recSong, recArtist] = rec.split(" by ");
          const query = encodeURIComponent(`${recSong} ${recArtist || ''}`);
          
          const itunesRes = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
          const itunesData = await itunesRes.json();

          if (itunesData.results.length > 0) {
            const track = itunesData.results[0];
            return {
              title: recSong || track.trackName,
              artist: recArtist || track.artistName,
              coverUrl: track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg'),
              previewUrl: track.previewUrl 
            };
          }
        } catch (e) {
          console.error("iTunes fetch error", e);
        }
        
        // Fallback if iTunes finds nothing
        const [fallbackSong, fallbackArtist] = rec.split(" by ");
        return {
          title: fallbackSong || rec,
          artist: fallbackArtist || "Unknown",
          coverUrl: null,
          previewUrl: null
        };
      })
    );

    data.recommendations = enrichedRecommendations;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze the song." },
      { status: 500 }
    );
  }
}