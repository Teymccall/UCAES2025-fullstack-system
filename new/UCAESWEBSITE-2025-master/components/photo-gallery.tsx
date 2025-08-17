"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type Photo = {
  src: string;
  alt: string;
  caption?: string;
  category: string;
};

const photos: Photo[] = [
  {
    src: "/images/photos/photo1.jpg",
    alt: "Group photo of UCAES students in green attire",
    caption: "Students at the annual agriculture exhibition",
    category: "Events"
  },
  {
    src: "/images/photos/photo2.jpg",
    alt: "UCAES faculty and students in formal attire",
    caption: "Faculty members and graduating class",
    category: "Graduation"
  },
  {
    src: "/images/photos/photo3.jpg",
    alt: "UCAES graduation ceremony",
    caption: "Graduation ceremony with university leadership",
    category: "Graduation"
  },
  {
    src: "/images/photos/photo5.jpg",
    alt: "UCAES ceremony with traditional attire",
    caption: "Cultural ceremony with traditional Ghanaian attire",
    category: "Cultural Events"
  },
  {
    src: "/images/photos/photo6.jpg",
    alt: "UCAES faculty members",
    caption: "Faculty members during an academic ceremony",
    category: "Academic"
  },
  {
    src: "/images/photos/photo6graduation.jpg",
    alt: "UCAES graduation ceremony",
    caption: "Graduates celebrating their achievements",
    category: "Graduation"
  },
  {
    src: "/images/photos/photo7.jpg",
    alt: "UCAES award ceremony",
    caption: "Recognition of academic excellence",
    category: "Awards"
  },
  {
    src: "/images/photos/photo8.jpg",
    alt: "UCAES students and faculty",
    caption: "Students and faculty celebrating together",
    category: "Events"
  },
  {
    src: "/images/photos/photo9.jpg",
    alt: "UCAES cultural celebration",
    caption: "Traditional cultural celebration on campus",
    category: "Cultural Events"
  },
  {
    src: "/images/photos/photo10.jpg",
    alt: "UCAES group photo",
    caption: "Students and faculty in traditional attire",
    category: "Cultural Events"
  },
  {
    src: "/images/photos/photo11.jpg",
    alt: "UCAES graduation group",
    caption: "Graduating class in academic regalia",
    category: "Graduation"
  },
  {
    src: "/images/photos/photo12.jpg",
    alt: "UCAES campus event",
    caption: "Students participating in campus activities",
    category: "Events"
  },
  {
    src: "/images/photos/photo13.jpg",
    alt: "UCAES agricultural demonstration",
    caption: "Practical agricultural training session",
    category: "Academic"
  },
  {
    src: "/images/photos/photo14.jpg",
    alt: "UCAES student presentation",
    caption: "Student research presentation",
    category: "Academic"
  },
  {
    src: "/images/photos/phot15.jpg",
    alt: "UCAES graduation ceremony",
    caption: "Graduation celebration with faculty",
    category: "Graduation"
  },
  {
    src: "/images/photos/photo16.jpg",
    alt: "UCAES cultural performance",
    caption: "Traditional cultural performance by students",
    category: "Cultural Events"
  },
  {
    src: "/images/photos/photo17.jpg",
    alt: "UCAES environmental project",
    caption: "Students working on environmental conservation",
    category: "Events"
  },
  {
    src: "/images/photos/photo18.jpg",
    alt: "UCAES community outreach",
    caption: "Community engagement and outreach activities",
    category: "Events"
  },
  {
    src: "/images/photos/photo19.jpg",
    alt: "UCAES student workshop",
    caption: "Hands-on workshop for students",
    category: "Academic"
  }
];

export function PhotoGallery({ category = "all" }: { category?: string }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const filteredPhotos = category === "all" 
    ? photos 
    : photos.filter(photo => photo.category === category);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setSelectedIndex(filteredPhotos.findIndex(p => p.src === photo.src));
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedPhoto(filteredPhotos[selectedIndex - 1]);
    } else {
      // Wrap around to the last photo
      setSelectedIndex(filteredPhotos.length - 1);
      setSelectedPhoto(filteredPhotos[filteredPhotos.length - 1]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < filteredPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedPhoto(filteredPhotos[selectedIndex + 1]);
    } else {
      // Wrap around to the first photo
      setSelectedIndex(0);
      setSelectedPhoto(filteredPhotos[0]);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, index) => (
          <Card key={index} className="overflow-hidden group hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="cursor-pointer" onClick={() => handlePhotoClick(photo)}>
              <div className="relative h-60 w-full">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-600/80 hover:bg-green-700 text-white text-xs">
                    {photo.category}
                  </Badge>
                </div>
              </div>
              {photo.caption && (
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{photo.caption}</p>
                </CardContent>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative">
            {selectedPhoto && (
              <>
                <div className="relative max-h-[80vh] w-full">
                  <img
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute bottom-0 w-full bg-black/60 text-white p-4 flex justify-between items-center">
                  <p className="text-sm">{selectedPhoto.caption}</p>
                  <Badge className="bg-green-600 text-white">{selectedPhoto.category}</Badge>
                </div>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 bg-black/40 text-white hover:bg-black/60 rounded-full p-2" 
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full p-2"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full p-2"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PhotoGalleryFiltered() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const categories = ["all", ...Array.from(new Set(photos.map(photo => photo.category)))];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category, index) => (
          <Badge 
            key={index}
            className={`cursor-pointer px-4 py-2 text-sm capitalize ${
              activeCategory === category 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <PhotoGallery category={activeCategory} />
    </div>
  );
} 