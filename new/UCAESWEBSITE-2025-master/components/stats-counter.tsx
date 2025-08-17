"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { 
    number: 5000, 
    label: "Active Students", 
    suffix: "+" 
  },
  { 
    number: 25, 
    label: "Years of Excellence", 
    suffix: "" 
  },
  { 
    number: 12, 
    label: "Academic Programs", 
    suffix: "" 
  },
  { 
    number: 98, 
    label: "Graduate Employment Rate", 
    suffix: "%" 
  }
];

export function StatsCounter() {
  const [counters, setCounters] = useState(stats.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const timers = stats.map((stat, index) => {
      const increment = Math.ceil(stat.number / 100);
      let current = 0;
      
      return setInterval(() => {
        current += increment;
        if (current >= stat.number) {
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = stat.number;
            return newCounters;
          });
          clearInterval(timers[index]);
        } else {
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = current;
            return newCounters;
          });
        }
      }, 50);
    });

    return () => timers.forEach(timer => clearInterval(timer));
  }, [isVisible]);

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center border-0 bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              {counters[index].toLocaleString()}{stat.suffix}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}