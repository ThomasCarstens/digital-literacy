
import React from "react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import AlbumCard from "@/components/AlbumCard";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { Music } from "lucide-react";

const History: React.FC = () => {
  const { albums } = useApp();
  
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto">
      <Header />
      
      <main className="flex-1">
        <div className="mb-6">
          <div className="animate-slide-down">
            <h1 className="text-3xl font-medium mb-1">Album History</h1>
            <p className="text-muted-foreground">Your recently scanned albums</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {albums.length === 0 ? (
            <div className="glass-panel h-60 flex flex-col items-center justify-center text-center animate-fade-in">
              <Music size={40} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-1">No Albums Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your scanned albums will appear here
              </p>
            </div>
          ) : (
            albums.map((album) => (
              <AlbumCard 
                key={`${album.id}-${album.timestamp}`} 
                album={album} 
                variant="history"
              />
            ))
          )}
        </div>
      </main>
      
      <SpotifyPlayer />
    </div>
  );
};

export default History;
