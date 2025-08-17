"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

interface VideoTourModalProps {
  videoTitle?: string;
}

export function VideoTourModal({
  videoTitle = "UCAES Virtual Campus Tour",
}: VideoTourModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const videoPath = "/videos/campus-tour.mp4";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="text-white hover:bg-white/10 relative animate-tour-glow bg-gradient-to-r from-green-600 via-green-400 to-amber-400 shadow-lg border-0"
          style={{ boxShadow: '0 0 0 0 rgba(34,197,94,0.7)' }}
        >
          <span className="absolute -inset-1 rounded-lg pointer-events-none animate-pulse-tour-glow"></span>
          <Play className="mr-2 h-5 w-5" />
          Watch Virtual Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black border-green-800">
        <DialogHeader className="p-4 border-b border-green-800/20">
          <DialogTitle className="text-white">{videoTitle}</DialogTitle>
        </DialogHeader>
        <div className="relative pb-[56.25%] h-0 w-full bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          )}
          <video
            src={videoPath}
            className="absolute top-0 left-0 w-full h-full"
            controls
            poster="/images/491786079_2447144912302922_4683092885302511258_n.jpg"
            onLoadedData={() => setIsLoading(false)}
            onError={(e) => {
              console.error("Video error:", e);
              setIsLoading(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 