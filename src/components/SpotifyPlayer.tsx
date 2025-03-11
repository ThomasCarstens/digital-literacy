import React from "react";
import { Music, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { playAlbum, pausePlayback } from "@/lib/spotify";
import { cn } from "@/lib/utils";
const SpotifyPlayer: React.FC = () => {
const { currentAlbum, isPlaying, setIsPlaying } = useApp();
if (!currentAlbum) return null;
const handlePlayPause = async () => {
if (isPlaying) {
const success = await pausePlayback();
if (success) {
setIsPlaying(false);
 }
 } else {
const success = await playAlbum(currentAlbum.spotifyId);
if (success) {
setIsPlaying(true);
 }
 }
 };
return (
<div className="spotify-player animate-slide-up z-10 transition-all duration-1500">
<div className="album-image w-12 h-12 rounded-md flex-shrink-0 overflow-hidden">
<img
src={currentAlbum.imageUrl}
alt={currentAlbum.name}
className="w-full h-full object-cover"
/>
</div>
<div className="flex-1 overflow-hidden">
<div className="truncate text-sm font-medium">{currentAlbum.name}</div>
<div className="truncate text-xs text-muted-foreground">{currentAlbum.artist}</div>
</div>
<div className="flex items-center gap-1">
<button className="p-2 rounded-full text-muted-foreground hover:text-primary transition-colors">
<SkipBack size={20} />
</button>
<button
className={cn(
"p-2 rounded-full transition-all duration-250",
isPlaying ? "bg-primary text-white" : "bg-secondary text-primary"
 )}
onClick={handlePlayPause}
>
{isPlaying ? <Pause size={20} /> : <Play size={20} />}
</button>
<button className="p-2 rounded-full text-muted-foreground hover:text-primary transition-colors">
<SkipForward size={20} />
</button>
</div>
</div>
 );
};
export default SpotifyPlayer;