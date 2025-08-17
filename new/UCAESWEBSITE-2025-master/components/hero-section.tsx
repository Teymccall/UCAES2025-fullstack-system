"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { VideoTourModal } from './video-tour-modal';

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: "/images/slideshow/491352551_2447144792302934_4196202264094401956_n.jpg",
      title: "Sustainable Agriculture Education",
      subtitle: "Excellence Since 1963",
      description: "Join Ghana's premier university for agriculture and environmental studies, founded by the Akyem Abuakwa Traditional Council."
    },
    {
      image: "/images/slideshow/491420847_2447144798969600_6632987473308643211_n.jpg",
      title: "Hands-on Agricultural Training",
      subtitle: "Practical Learning",
      description: "Our students gain practical experience in sustainable farming techniques and environmental conservation."
    },
    {
      image: "/images/slideshow/491576329_2447144848969595_4480475179503889807_n.jpg",
      title: "Field Research and Practice",
      subtitle: "Real-World Experience",
      description: "Students engage in field research to develop innovative solutions for agricultural challenges."
    },
    {
      image: "/images/slideshow/491603066_2447144888969591_5681002713842649742_n.jpg",
      title: "Conservation and Preservation",
      subtitle: "Environmental Stewardship",
      description: "Leading the way in sustainable farming practices and environmental conservation with our specialized programs."
    },
    {
      image: "/images/slideshow/491786079_2447144912302922_4683092885302511258_n.jpg",
      title: "Developing Environmental Leaders",
      subtitle: "Quality Education",
      description: "Preparing students for successful careers in sustainable agriculture, environmental science, and waste management."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 to-black/40" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <Badge variant="secondary" className="mb-4 bg-green-700/30 text-amber-100 border-green-700/50">
            {slides[currentSlide].subtitle}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-amber-100">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {slides[currentSlide].description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-amber-100">
              <Link href="/apply">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-amber-100 text-amber-100 hover:bg-green-700/20 hover:text-white">
              <Link href="/academics">
                Explore Programs
              </Link>
            </Button>
            <VideoTourModal />
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-green-500' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <ChevronDown className="h-6 w-6 text-amber-100" />
      </div>
    </section>
  );
}