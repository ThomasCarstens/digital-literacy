
// Mock Spotify API service
// In a real app, this would connect to the Spotify Web API

import { toast } from "../hooks/use-toast";
import type { Album } from "../context/AppContext";

const mockAlbums = [
  {
    id: "1",
    name: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe",
    spotifyId: "4LH4d3cOWNNsVw41Gqt2kv",
  },
  {
    id: "2",
    name: "Thriller",
    artist: "Michael Jackson",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526cbab2be",
    spotifyId: "2ANVost0y2y52ema1E9xAZ",
  },
  {
    id: "3",
    name: "Abbey Road",
    artist: "The Beatles",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25",
    spotifyId: "0ETFjACtuP2ADo6LFhL6HN",
  },
  {
    id: "4",
    name: "Back in Black",
    artist: "AC/DC",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273d9b35b805b4a55de2cc0458e",
    spotifyId: "6mUdeDZCsExyJLMdAfDuwh",
  },
  {
    id: "5",
    name: "Rumours",
    artist: "Fleetwood Mac",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b",
    spotifyId: "1bt6q2SruMsBtcerNVtpZB",
  },
];

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

// Mock function to identify an album from an image
export const identifyAlbumFromImage = async (imageUrl: string): Promise<Album | null> => {
  try {
    // Simulate API latency
    await delay(2000);
    
    // Randomly select a mock album (in a real app, this would use computer vision)
    const randomIndex = Math.floor(Math.random() * mockAlbums.length);
    const album = mockAlbums[randomIndex];
    
    return {
      ...album,
      timestamp: Date.now(),
    };
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

// Mock function to play album on Spotify
export const playAlbum = async (spotifyId: string): Promise<boolean> => {
  try {
    // Simulate API latency
    await delay(800);
    
    toast({
      title: "Now Playing",
      description: "Album started playing on Spotify",
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

// Mock function to pause Spotify playback
export const pausePlayback = async (): Promise<boolean> => {
  try {
    // Simulate API latency
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
