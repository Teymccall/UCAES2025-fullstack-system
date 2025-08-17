"use client";

import { useEffect, useState } from 'react';
import { Loader } from '@/components/ui/loader';
import { GraduationCap } from 'lucide-react';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="p-3 bg-primary rounded-xl">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">UCAES</h1>
            <p className="text-sm text-muted-foreground">Growing Knowledge</p>
          </div>
        </div>
        <Loader size="lg" className="mx-auto" />
        <p className="text-muted-foreground text-sm">Loading your agricultural education portal...</p>
      </div>
    </div>
  );
}