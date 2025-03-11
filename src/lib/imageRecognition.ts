import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// import { logger } from 'genkit/logging';
// logger.setLogLevel('debug');
// Type definitions for the Spotify album response
interface SpotifyAlbumResponse {
  albumTitle: string;
  artist: string;
  spotifyAlbumId: string;
  spotifyUrl: string;
  releaseDate?: string;
  totalTracks?: number;
}

// Function to capture an image from the camera and find album on Spotify
export const captureAndFindAlbum = async (): Promise<SpotifyAlbumResponse | null> => {
  try {
    // Step 1: Capture image from camera
    const imageDataUrl = await captureImage();
    if (!imageDataUrl) {
      throw new Error("Failed to capture image");
    }

    // Step 2: Convert image to base64 (remove the data:image/jpeg;base64, prefix)
    const base64Image = imageDataUrl.split(',')[1];
    
    // Step 3: Call Firebase Genkit function
    const result = await callFindAlbumFunction(base64Image);
    
    // Step 4: Return album information
    return result;
  } catch (error) {
    console.error("Error in album recognition process:", error);
    alert(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    return null;
  }
};

// Helper function to call the Firebase Genkit function
const callFindAlbumFunction = async (base64Image: string): Promise<SpotifyAlbumResponse> => {
  try {
    console.log('callFindAlbumFunction')
    // logger.log('callFindAlbumFunction')
    // Initialize Firebase functions
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

// Function to capture an image from the camera
export const captureImage = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject(new Error("Your browser doesn't support camera access"));
      return;
    }
    
    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        // Create video element
        const video = document.createElement("video");
        video.srcObject = stream;
        video.setAttribute("playsinline", "true"); // Required for iOS
        
        // Create canvas for snapshot
        const canvas = document.createElement("canvas");
        
        // When video is ready
        video.onloadedmetadata = () => {
          video.play();
          
          // Set canvas size to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          const context = canvas.getContext("2d");
          if (!context) {
            stopMediaTracks(stream);
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get data URL from canvas
          const imageDataUrl = canvas.toDataURL("image/jpeg");
          
          // Stop all video tracks to release camera
          stopMediaTracks(stream);
          
          // Return image data URL
          resolve(imageDataUrl);
        };
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
        reject(new Error("Could not access camera"));
      });
  });
};

// Helper function to stop media tracks
const stopMediaTracks = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

// Function to play an album on Spotify
export const playAlbumOnSpotify = (spotifyUrl: string) => {
  // Option 1: Open Spotify URL in a new tab
  window.open(spotifyUrl, "_blank");
  
  // Option 2: If you have Spotify Web Playback SDK implemented, you could use that instead
  // See: https://developer.spotify.com/documentation/web-playback-sdk/
};

// Example usage:
// This function can be called from a button click handler
export const handleRecognizeAlbum = async () => {
  try {
    // Show loading indicator
    // setLoading(true);  // If using React state
    
    // Capture image and find album
    const albumInfo = await captureAndFindAlbum();
    
    if (albumInfo) {
      // Display album information to the user
      console.log("Album found:", albumInfo);
      
      // You could update your UI with the album information here
      // setAlbumInfo(albumInfo);  // If using React state
      
      // Ask user if they want to play the album
      if (confirm(`Found "${albumInfo.albumTitle}" by ${albumInfo.artist}. Open in Spotify?`)) {
        playAlbumOnSpotify(albumInfo.spotifyUrl);
      }
    }
  } catch (error) {
    console.error("Error recognizing album:", error);
    alert("Failed to recognize album. Please try again.");
  } finally {
    // Hide loading indicator
    // setLoading(false);  // If using React state
  }
};