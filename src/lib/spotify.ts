// Spotify API service with Genkit integration
import { toast } from "../hooks/use-toast";
import type { Album } from "../context/AppContext";
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { captureImage } from "./imageRecognition";

// // Initialize Firebase
// const initFirebase = () => {
//   // Your Firebase configuration
//   // Replace this with your actual Firebase config
//   const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_AUTH_DOMAIN",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_STORAGE_BUCKET",
//     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//     appId: "YOUR_APP_ID"
//   };

//   // Initialize Firebase
//   return initializeApp(firebaseConfig);
// };

// // Initialize Firebase app
// const firebaseApp = initFirebase();

// Type definitions for the Spotify album response from Genkit
interface SpotifyAlbumResponse {
  albumTitle: string;
  artist: string;
  spotifyAlbumId: string;
  spotifyUrl: string;
  releaseDate?: string;
  totalTracks?: number;
}

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In a real app, this would authenticate with Spotify
export const authenticateWithSpotify = async (): Promise<boolean> => {
  try {
    await delay(800);
    return true;
  } catch (error) {
    console.error("Spotify authentication error:", error);
    toast({
      title: "Authentication Failed",
      description: "Could not connect to Spotify",
      variant: "destructive",
    });
    return false;
  }
};

// Helper function to call the Firebase Genkit function
const callFindAlbumFunction = async (base64Image: string): Promise<SpotifyAlbumResponse> => {
  try {
    // Get Firebase functions instance
    const functions = getFunctions();
    
    // Create callable function reference
    const findAlbumOnSpotify = httpsCallable<
      { image: string }, 
      SpotifyAlbumResponse
    >(functions, 'findAlbumOnSpotify');
    
    // Call the function with the base64 image
    const result = await findAlbumOnSpotify({ image: base64Image });
    
    // Return the data from the function call
    return result.data;
  } catch (error) {
    console.error("Firebase function call failed:", error);
    throw new Error("Album recognition failed. Please try again.");
  }
};

// Function to identify an album from an image using Genkit
export const identifyAlbumFromImage = async (): Promise<Album | null> => {
  try {
    toast({
      title: "Processing",
      description: "Capturing image and identifying album...",
    });

    // Step 1: Capture image from camera
    const imageDataUrl = await captureImage();
    if (!imageDataUrl) {
      throw new Error("Failed to capture image");
    }

    // Step 2: Convert image to base64 (remove the data:image/jpeg;base64, prefix)
    const base64Image = imageDataUrl.split(',')[1];
    
    toast({
      title: "Analyzing",
      description: "Identifying album from image...",
    });

    // Step 3: Call Firebase Genkit function
    const albumInfo = await callFindAlbumFunction(base64Image);
    
    // Step 4: Convert to the Album format expected by your app
    const album: Album = {
      id: albumInfo.spotifyAlbumId, // Using Spotify ID as the album ID
      name: albumInfo.albumTitle,
      artist: albumInfo.artist,
      imageUrl: "", // Note: The Genkit function doesn't return an image URL
      spotifyId: albumInfo.spotifyAlbumId,
      timestamp: Date.now(),
      spotifyUrl: albumInfo.spotifyUrl
    };
    
    toast({
      title: "Success",
      description: `Found "${album.name}" by ${album.artist}`,
    });
    
    return album;
  } catch (error) {
    console.error("Album identification error:", error);
    toast({
      title: "Identification Failed",
      description: "Could not identify album from image",
      variant: "destructive",
    });
    return null;
  }
};

// Function to play album on Spotify
export const playAlbum = async (spotifyId: string): Promise<boolean> => {
  try {
    // You could use the Spotify Web Playback SDK here if integrated
    // For now, we'll open the Spotify URL in a new tab
    
    // Construct Spotify URI from ID
    const spotifyUri = `spotify:album:${spotifyId}`;
    
    // Try to open the Spotify app first using URI
    window.location.href = spotifyUri;
    
    toast({
      title: "Now Playing",
      description: "Album opened in Spotify sdafsd",
    });
    return true;
  } catch (error) {
    console.error("Spotify playback error:", error);
    toast({
      title: "Playback Failed",
      description: "Could not play album on Spotify",
      variant: "destructive",
    });
    return false;
  }
};

// Function to play album using spotifyUrl
export const playAlbumWithUrl = async (spotifyUrl: string): Promise<boolean> => {
  try {
    // Open Spotify URL in a new tab
    window.open(spotifyUrl, "_blank");
    
    toast({
      title: "Opening Spotify",
      description: "Album link opened in new tab",
    });
    return true;
  } catch (error) {
    console.error("Spotify URL open error:", error);
    toast({
      title: "Failed",
      description: "Could not open Spotify link",
      variant: "destructive",
    });
    return false;
  }
};

// Function to pause Spotify playback
export const pausePlayback = async (): Promise<boolean> => {
  try {
    // This would use Spotify Web API or SDK in a real integration
    await delay(400);
    toast({
      title: "Paused",
      description: "Playback paused",
    });
    return true;
  } catch (error) {
    console.error("Spotify pause error:", error);
    toast({
      title: "Error",
      description: "Could not pause playback",
      variant: "destructive",
    });
    return false;
  }
};