
import React, { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { captureImage } from "@/lib/imageRecognition";
import { useApp } from "@/context/AppContext";
import { Camera as CameraIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { setCapturedImage } = useApp();

  // Start the camera stream when the component mounts
  useEffect(() => {
    startCamera();
    
    // Clean up when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access");
      toast({
        title: "Camera Error",
        description: "Your browser doesn't support camera access",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Could not access camera");
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const handleCapture = async () => {
    try {
      const imageDataUrl = await captureImage();
      if (imageDataUrl) {
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Capture Error",
        description: "Failed to capture image",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    startCamera();
  };

  return (
    <div className="animate-fade-in camera-container">
      {cameraError ? (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <CameraIcon size={48} className="text-white/60 mb-4" />
          <p className="text-white mb-4">{cameraError}</p>
          <Button onClick={handleRetry} variant="outline" className="bg-white/10 text-white hover:bg-white/20">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {cameraActive && (
            <button 
              className="camera-shutter animate-fade-in"
              onClick={handleCapture}
            />
          )}
          
          <div className="absolute top-4 left-4 text-white text-xs bg-black/30 rounded-full px-3 py-1 animate-pulse-light">
            Point at a CD cover
          </div>
        </>
      )}
    </div>
  );
};

export default Camera;
