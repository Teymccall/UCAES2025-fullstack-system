"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroSection } from '@/components/hero-section';
import { StatsCounter } from '@/components/stats-counter';
import { RequiredDocuments } from '@/components/required-documents';
import { 
  Users, 
  BookOpen, 
  Award, 
  Globe,
  ArrowRight,
  Calendar,
  MapPin,
  Leaf,
  Microscope,
  TrendingUp,
  Shield,
  Info
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Learn from experienced professionals and renowned researchers in agriculture and environmental sciences with over 200 qualified faculty members."
  },
  {
    icon: BookOpen,
    title: "Modern Curriculum",
    description: "Updated programs that blend traditional knowledge with cutting-edge technology, sustainable practices, and industry-relevant skills."
  },
  {
    icon: Award,
    title: "Industry Recognition",
    description: "Fully accredited programs with strong industry partnerships and excellent graduate employment rates exceeding 95%."
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "International collaborations with universities in UK, USA, and other African countries to broaden your educational experience."
  }
];

const achievements = [
  {
    icon: Leaf,
    title: "Sustainable Agriculture Pioneer",
    description: "Leading research in climate-smart agriculture and sustainable farming practices across West Africa."
  },
  {
    icon: Microscope,
    title: "Research Excellence",
    description: "Over 500 published research papers and 50+ ongoing research projects in agricultural innovation."
  },
  {
    icon: TrendingUp,
    title: "Graduate Success",
    description: "95% employment rate within 6 months of graduation with average starting salary of GHS 3,500."
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Fully accredited by National Accreditation Board (NAB) and recognized by professional bodies."
  }
];

const upcomingEvents = [
  {
    title: "Open House Day 2024",
    date: "March 15, 2024",
    location: "Main Campus, Bunso",
    type: "Campus Visit",
    description: "Explore our facilities, meet faculty, and learn about our programs"
  },
  {
    title: "Agricultural Innovation Symposium",
    date: "March 22, 2024",
    location: "Conference Hall",
    type: "Academic",
    description: "International conference on sustainable agriculture and climate change"
  },
  {
    title: "Student Orientation Week",
    date: "April 1-5, 2024",
    location: "Various Locations",
    type: "Student Life",
    description: "Welcome new students with comprehensive orientation programs"
  },
  {
    title: "Career Fair 2024",
    date: "April 12, 2024",
    location: "Sports Complex",
    type: "Career",
    description: "Connect with top employers in agriculture and environmental sectors"
  }
];

export default function HomePage() {
  const [showWatermark, setShowWatermark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <HeroSection />
        {/* Watermark Icon */}
        <button
          className="absolute top-4 right-4 opacity-30 hover:opacity-80 transition-opacity z-50"
          style={{ outline: 'none' }}
          aria-label="Show watermark"
          onClick={() => setShowWatermark((v) => !v)}
        >
          <Info className="h-5 w-5" />
        </button>
        {showWatermark && (
          <div className="absolute top-10 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-2 text-xs text-gray-700 dark:text-gray-200 z-50 animate-fade-in">
            This is my watermark.<br />Developed by Hanamel Achumboro Awenatey.<br />Contact: 0201778656
          </div>
        )}
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <StatsCounter />
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div>
                <Badge className="mb-4 bg-green-700 hover:bg-green-800 text-white py-1 px-4 rounded-full">About UCAES</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 mt-4">
                  Leading Agricultural Education in Ghana
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  For over two decades, the University College of Agriculture and Environmental Studies has been at the forefront of agricultural education, research, and innovation in Ghana and West Africa.
                </p>
                <p className="text-muted-foreground mb-8">
                  Located in Bunso, Eastern Region, we combine traditional agricultural wisdom with modern scientific approaches, empowering our students to become leaders in sustainable farming, environmental conservation, and agribusiness development.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-700">24+</div>
                    <div className="text-sm text-gray-600">Years of Excellence</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-700">15,000+</div>
                    <div className="text-sm text-gray-600">Alumni Worldwide</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-white">
                  <Link href="/about">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-green-700 text-green-700 hover:bg-green-50">
                  <Link href="/academics">
                    View Programs
                  </Link>
                </Button>
              </div>
            </div>
            <div className="animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/slideshow/491786079_2447144912302922_4683092885302511258_n.jpg"
                  alt="Students in agricultural field at UCAES"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-6">
                  <h3 className="font-bold text-lg text-green-800">Practical Learning</h3>
                  <p className="text-gray-700">Hands-on experience in our 200-acre demonstration farm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">Why Choose UCAES</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Excellence in Agricultural Education
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what makes our university the premier choice for agricultural and environmental studies in Ghana and West Africa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-background/60 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mb-4 group-hover:bg-secondary/20 transition-colors">
                    <achievement.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-muted-foreground text-sm">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life Photos Section */}
      <section className="py-20 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="mb-4">Campus Life</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Student Life at UCAES
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover the vibrant community and student experiences at our university through these snapshots of campus life.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="overflow-hidden rounded-lg shadow-md group">
                <img 
                  src="/images/photos/photo1.jpg" 
                  alt="UCAES students in green attire" 
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="overflow-hidden rounded-lg shadow-md group">
                <img 
                  src="/images/photos/photo2.jpg" 
                  alt="UCAES faculty and students" 
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="overflow-hidden rounded-lg shadow-md group">
                <img 
                  src="/images/photos/photo3.jpg" 
                  alt="UCAES graduation ceremony" 
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            
            <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-white">
              <Link href="/campus-life">
                Explore Campus Life
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 animate-fade-in">
              <Badge variant="secondary" className="mb-4">Upcoming Events</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Join Our Campus Activities
              </h2>
              <p className="text-muted-foreground mb-6">
                Stay connected with our vibrant campus community through various events, workshops, academic conferences, and career development activities throughout the year.
              </p>
              <Button asChild variant="outline">
                <Link href="/news">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="lg:w-2/3">
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow animate-slide-up">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-muted-foreground text-sm">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <RequiredDocuments />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of students who have chosen UCAES to build successful careers in agriculture, environmental sciences, and agribusiness. Applications are now open for 2024/2025 academic year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/admissions">
                  Apply for Admission
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/contact">
                  Schedule a Visit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}