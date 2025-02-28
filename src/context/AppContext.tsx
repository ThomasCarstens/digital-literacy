import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../hooks/use-toast";

export type Album = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  spotifyId: string;
  timestamp: number;
};

interface AppContextType {
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  currentAlbum: Album | null;
  setCurrentAlbum: (album: Album | null) => void;
  albums: Album[];
  addAlbum: (album: Album) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load albums from localStorage on initial render
  useEffect(() => {
    try {
      const savedAlbums = localStorage.getItem("snap-and-play-albums");
      if (savedAlbums) {
        setAlbums(JSON.parse(savedAlbums));
      }
    } catch (error) {
      console.error("Failed to load albums from localStorage", error);
      toast({
        title: "Error",
        description: "Failed to load your album history",
        variant: "destructive",
      });
    }
  }, []);

  // Save albums to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("snap-and-play-albums", JSON.stringify(albums));
    } catch (error) {
      console.error("Failed to save albums to localStorage", error);
    }
  }, [albums]);

  const addAlbum = (album: Album) => {
    setAlbums((prevAlbums) => {
      // Check if album already exists, if so, move it to the top
      const existingAlbumIndex = prevAlbums.findIndex(a => a.id === album.id);
      if (existingAlbumIndex !== -1) {
        const newAlbums = [...prevAlbums];
        newAlbums.splice(existingAlbumIndex, 1);
        return [album, ...newAlbums];
      }
      // Otherwise add it to the top
      return [album, ...prevAlbums];
    });
  };

  return (
    <AppContext.Provider
      value={{
        capturedImage,
        setCapturedImage,
        isProcessing,
        setIsProcessing,
        currentAlbum,
        setCurrentAlbum,
        albums,
        addAlbum,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
