
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, History, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Header: React.FC = () => {
  const location = useLocation();
  
  const handleInfoClick = () => {
    toast({
      title: "About Snap & Play",
      description: "Take a photo of any CD cover to instantly play it on Spotify",
    });
  };
  
  return (
    <header className="animate-fade-in py-4 px-6 flex items-center justify-between glass-panel mb-8">
      <div className="text-xl font-medium">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Snap & Play
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Link to="/">
          <Button
            variant={location.pathname === "/" ? "default" : "ghost"}
            size="icon"
            className="transition-all duration-250"
          >
            <Camera size={20} />
          </Button>
        </Link>
        
        <Link to="/history">
          <Button
            variant={location.pathname === "/history" ? "default" : "ghost"}
            size="icon"
            className="transition-all duration-250"
          >
            <History size={20} />
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleInfoClick}
          className="transition-all duration-250"
        >
          <Info size={20} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
