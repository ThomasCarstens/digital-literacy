
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Camera as CameraIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import Camera from "@/components/Camera";
import AlbumCard from "@/components/AlbumCard";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import Header from "@/components/Header";
import { identifyAlbumFromImage } from "@/lib/spotify";

const Index: React.FC = () => {
  const {
    capturedImage,
    setCapturedImage,
    isProcessing,
    setIsProcessing,
    currentAlbum,
    setCurrentAlbum,
    addAlbum,
  } = useApp();
  
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  useEffect(() => {
    // Mark first render complete after mount
    setIsFirstRender(false);
  }, []);

  // Process captured image
  useEffect(() => {
    const processImage = async () => {
      if (capturedImage && !isProcessing) {
        setIsProcessing(true);
        
        try {
          toast({
            title: "Processing image",
            description: "Looking for album matches...",
          });
          
          const identifiedAlbum = await identifyAlbumFromImage(capturedImage);
          
          if (identifiedAlbum) {
            setCurrentAlbum(identifiedAlbum);
            addAlbum(identifiedAlbum);
            
            toast({
              title: "Album Found",
              description: `Found "${identifiedAlbum.name}" by ${identifiedAlbum.artist}`,
            });
          }
        } catch (error) {
          console.error("Error processing image:", error);
          toast({
            title: "Processing Error",
            description: "Failed to process image",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    processImage();
  }, [capturedImage]);

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="mb-6 animate-slide-down">
          <h1 className="text-3xl font-medium mb-1">Snap & Play</h1>
          <p className="text-muted-foreground">
            Take a photo of any CD cover to play it on Spotify
          </p>
        </div>
        
        {!capturedImage ? (
          // Camera view
          <div className="flex flex-col items-center">
            <Camera />
            
            <div className="mt-8 text-center max-w-md">
              <p className="text-muted-foreground text-sm">
                Position the CD cover within the frame and tap the button to take a photo
              </p>
            </div>
          </div>
        ) : (
          // Results view
          <div className="animate-fade-in">
            {/* Preview the captured image */}
            <div className="camera-container mb-4">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  <Loader2 size={40} className="text-white animate-spin-slow mb-4" />
                  <p className="text-white text-sm">Identifying album...</p>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handleRetake}
                variant="outline"
                disabled={isProcessing}
              >
                <CameraIcon size={16} className="mr-2" />
                Take Another Photo
              </Button>
            </div>
            
            {/* Identified album result */}
            {currentAlbum && !isFirstRender && (
              <AlbumCard album={currentAlbum} variant="result" />
            )}
          </div>
        )}
      </main>
      
      <SpotifyPlayer />
    </div>
  );
};

export default Index;
