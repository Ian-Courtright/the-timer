import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { soundEffects } from "./lib/sounds/soundEffects";

const queryClient = new QueryClient();

const App = () => {
  const [soundsInitialized, setSoundsInitialized] = useState(false);

  // Initialize sound system on component mount
  useEffect(() => {
    // Create a user interaction handler to initialize audio
    const initializeAudio = () => {
      console.log("Initializing audio system");
      
      // Play a silent sound to unlock audio on iOS/Safari
      const silentSound = new Audio();
      silentSound.play().catch(err => console.log('Initial silent sound play error (expected):', err));
      
      // Initialize our sound effects
      soundEffects.initSounds();
      
      // Mark sounds as initialized
      setSoundsInitialized(true);
      
      // Remove event listeners
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('keydown', initializeAudio);
    };
    
    // Add event listeners for first user interaction
    document.addEventListener('click', initializeAudio);
    document.addEventListener('touchstart', initializeAudio);
    document.addEventListener('keydown', initializeAudio);
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('keydown', initializeAudio);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
