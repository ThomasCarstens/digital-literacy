import { genkit, z, UserFacingError } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Pro } from "@genkit-ai/googleai";
import { hasClaim, onCallGenkit } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from 'firebase-admin/app';
import { logger } from 'genkit/logging';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import axios from 'axios';

initializeApp();

// Define API keys as secrets
const googleApiKey = defineSecret("GOOGLE_API_KEY");
const spotifyClientId = defineSecret("SPOTIFY_CLIENT_ID");
const spotifyClientSecret = defineSecret("SPOTIFY_CLIENT_SECRET");

// Enable Firebase telemetry with proper configuration
enableFirebaseTelemetry({
  forceDevExport: true,
});

// Set logger level to debug
logger.setLogLevel('debug');

const ai = genkit({
  model: gemini15Pro,
  plugins: [googleAI()],
});

// Define input schema
const inputSchema = z.object({
  image: z.string().describe("Base64 encoded image of the album cover"),
});

// Define output schema for album identification
const albumIdentificationSchema = z.object({
  albumTitle: z.string(),
  artist: z.string(),
});

// Define final output schema with Spotify information
const outputSchema = z.object({
  albumTitle: z.string(),
  artist: z.string(),
  spotifyAlbumId: z.string(),
  spotifyUrl: z.string(),
  releaseDate: z.string().optional(),
  totalTracks: z.number().optional(),
});

// Async function to get Spotify access token
async function getSpotifyToken(clientId: string, clientSecret: string): Promise<string> {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      data: 'grant_type=client_credentials'
    });
    
    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to get Spotify token:', error);
    throw new UserFacingError('INTERNAL', 'Failed to authenticate with Spotify API');
  }
}

// Function to search Spotify for an album
async function searchSpotifyAlbum(albumTitle: string, artist: string, token: string) {
  try {
    // Encode the search query
    const query = encodeURIComponent(`album:${albumTitle} artist:${artist}`);
    
    // Make the search request
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Check if we have results
    if (response.data.albums.items.length === 0) {
      throw new UserFacingError('NOT_FOUND', `Could not find album "${albumTitle}" by "${artist}" on Spotify`);
    }
    
    // Return the album information
    const album = response.data.albums.items[0];
    return {
      spotifyAlbumId: album.id,
      spotifyUrl: album.external_urls.spotify,
      releaseDate: album.release_date,
      totalTracks: album.total_tracks
    };
  } catch (error) {
    if (error instanceof UserFacingError) {
      throw error;
    }
    logger.error('Spotify search error:', error);
    throw new UserFacingError('NOT_FOUND', 'Error searching for album on Spotify');
  }
}

// Define the album analysis and Spotify lookup flow
const albumSpotifyFlow = ai.defineFlow({
  name: "albumSpotifyFlow",
  inputSchema,
  outputSchema,
  streamSchema: z.string(),
}, async (input, { sendChunk }) => {
  try {
    // Create image URL from base64
    const imageUrl = `data:image/jpeg;base64,${input.image}`;
    logger.info('Processing album cover image');
    
    // Step 1: Analyze the image to identify album title and artist
    sendChunk("🔍 Analyzing album cover...");
    
    const promptText = `
      Analyze this album cover image and extract the following information:
      - Album title
      - Artist/band name
      
      Be precise with the spelling and formatting of both the album title and artist name.
      Return ONLY a valid JSON object with these fields:
      {
        "albumTitle": "Title of the album",
        "artist": "Name of the artist or band"
      }
    `;

    // Generate with AI model
    const { text } = await ai.generate({
      model: gemini15Pro,
      prompt: [
        { text: promptText },
        { media: { contentType: 'image/jpeg', url: imageUrl } }
      ]
    });

    // Parse the AI response
    let albumInfo;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      albumInfo = albumIdentificationSchema.parse(parsedResponse);
      
      sendChunk(`✅ Identified album: "${albumInfo.albumTitle}" by ${albumInfo.artist}`);
      logger.info(`Album identified: ${albumInfo.albumTitle} by ${albumInfo.artist}`);
    } catch (parseError) {
      logger.error('Failed to parse album information:', parseError);
      throw new UserFacingError('INTERNAL', 'Failed to identify album information from the image');
    }

    // Step 2: Look up the album on Spotify
    sendChunk(`🔎 Searching Spotify for "${albumInfo.albumTitle}" by ${albumInfo.artist}...`);

    try {
    // Get Spotify credentials
    const clientId = await spotifyClientId.value();
    const clientSecret = await spotifyClientSecret.value();
    
    // Get Spotify access token
    const spotifyToken = await getSpotifyToken(clientId, clientSecret);
    
    // Search for the album
    const spotifyInfo = await searchSpotifyAlbum(albumInfo.albumTitle, albumInfo.artist, spotifyToken);
    
    sendChunk(`✅ Found album on Spotify! ID: ${spotifyInfo.spotifyAlbumId}`);
    logger.info(`✅ Found album on Spotify! ID: ${spotifyInfo.spotifyAlbumId}`);
    // Return combined information
    return {
      ...albumInfo,
      ...spotifyInfo
    };
  } catch (error) {
    // If it's already a UserFacingError, just rethrow it
    if (error instanceof UserFacingError) {
      throw error;
    }
    
    // Otherwise, log and convert to a user-facing error
    logger.error('Unhandled error in Chunk 2:', error);
    throw new UserFacingError('INTERNAL', 'Chunk 2 Spotify API Error');
  }
  } catch (error) {
    // If it's already a UserFacingError, just rethrow it
    if (error instanceof UserFacingError) {
      throw error;
    }
    
    // Otherwise, log and convert to a user-facing error
    logger.error('Unhandled error in album analysis:', error);
    throw new UserFacingError('INTERNAL', 'Unhandled error in album analysis');
  }
});

// Export the Cloud Function with enhanced security
export const findAlbumOnSpotify = onCallGenkit({
  // authPolicy: hasClaim('email_verified'),
  secrets: [googleApiKey, spotifyClientId, spotifyClientSecret],
  cors: true, // Enable CORS for all origins
}, albumSpotifyFlow);