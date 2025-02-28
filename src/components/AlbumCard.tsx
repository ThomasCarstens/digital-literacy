
import React from "react";
import { Play, Pause } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Album } from "@/context/AppContext";
import { playAlbum, pausePlayback } from "@/lib/spotify";
import { cn } from "@/lib/utils";

interface AlbumCardProps {
  album: Album;
  variant?: "result" | "history";
  className?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  variant = "result",
  className,
}) => {
  const { currentAlbum, setCurrentAlbum, isPlaying, setIsPlaying } = useApp();
  
  const isCurrentAlbum = currentAlbum?.id === album.id;
  
  const handlePlay = async () => {
    if (isCurrentAlbum && isPlaying) {
      // Pause the current album
      const success = await pausePlayback();
      if (success) {
        setIsPlaying(false);
      }
    } else {
      // Play the selected album
      const success = await playAlbum(album.spotifyId);
      if (success) {
        setCurrentAlbum(album);
        setIsPlaying(true);
      }
    }
  };
  
  const formattedDate = new Date(album.timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  return (
    <div 
      className={cn(
        "album-card animate-scale-in",
        variant === "result" ? "bg-white/90" : "bg-white/80",
        className
      )}
    >
      <div className="flex gap-4">
        <div className="album-image relative overflow-hidden flex-shrink-0" style={{ width: variant === "result" ? 160 : 80 }}>
          <img 
            src={album.imageUrl} 
            alt={album.name}
            className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 flex flex-col">
          <div>
            <div className="text-xs text-primary/60 font-medium uppercase tracking-wide">
              {variant === "result" ? "Identified Album" : formattedDate}
            </div>
            <h3 className="text-lg font-medium mt-1 text-balance">{album.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{album.artist}</p>
          </div>
          
          <div className="mt-auto">
            <button
              onClick={handlePlay}
              className={cn(
                "flex items-center gap-2 text-sm rounded-md transition-all duration-250 px-3 py-1.5",
                isCurrentAlbum && isPlaying
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {isCurrentAlbum && isPlaying ? (
                <>
                  <Pause size={16} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Play on Spotify</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
