"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoGallery, PhotoGalleryFiltered } from '@/components/photo-gallery';
import { Camera, Users, Calendar, Award, Leaf, BookOpen, Music, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CampusLifePage() {
  return (
    <div>
      {/* Page Title */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <Badge className="px-4 py-1.5 text-base bg-green-700 text-white border-green-600 hover:bg-green-700">Campus Experience</Badge>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-green-600 dark:from-green-400 dark:to-green-200">
              Student Life at UCAES
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the vibrant and diverse community at the University College of Agriculture and Environmental Studies. From academic achievements to cultural events, our campus life offers a well-rounded experience for all students.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <div className="w-16 h-1 bg-green-600 rounded-full"></div>
              <div className="w-3 h-1 bg-green-400 rounded-full"></div>
              <div className="w-3 h-1 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Life Overview */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 dark:from-transparent dark:to-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="px-3 py-1 text-sm bg-green-700 text-white mb-4">Our Community</Badge>
                <h2 className="text-4xl font-bold tracking-tight mb-6">A Vibrant Learning Community</h2>
                <div className="w-20 h-1.5 bg-green-600 rounded-full mb-6"></div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  At UCAES, we believe that education extends beyond the classroom. Our campus life is designed to provide students with a holistic experience that nurtures academic excellence, cultural awareness, and personal growth.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 dark:border-green-900/30">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-14 h-14 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Diverse Community</h3>
                  <p className="text-muted-foreground">Students from various backgrounds coming together to learn and grow</p>
                </div>
                
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100 dark:border-amber-900/30">
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 w-14 h-14 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Cultural Events</h3>
                  <p className="text-muted-foreground">Celebrating our rich heritage through diverse cultural programs</p>
                </div>
                
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 dark:border-blue-900/30">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 w-14 h-14 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Academic Excellence</h3>
                  <p className="text-muted-foreground">Commitment to quality education and intellectual growth</p>
                </div>
                
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 dark:border-green-900/30">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-14 h-14 flex items-center justify-center mb-4">
                    <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sustainable Living</h3>
                  <p className="text-muted-foreground">Promoting eco-friendly practices and environmental stewardship</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl shadow-lg group">
                    <img 
                      src="/images/photos/photo12.jpg" 
                      alt="UCAES Campus Event" 
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-lg group">
                    <img 
                      src="/images/photos/photo16.jpg" 
                      alt="Cultural Performance" 
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-6 pt-10">
                  <div className="overflow-hidden rounded-2xl shadow-lg group">
                    <img 
                      src="/images/photos/photo18.jpg" 
                      alt="Community Outreach" 
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-lg group">
                    <img 
                      src="/images/photos/photo19.jpg" 
                      alt="Student Workshop" 
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-2xl font-bold z-10 shadow-xl border-4 border-white dark:border-gray-800 transform hover:rotate-12 transition-transform duration-300">
                UCAES
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-24 bg-white dark:bg-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-4 py-1.5 text-base bg-green-700 hover:bg-green-800 text-white">Photo Gallery</Badge>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-green-600 dark:from-green-400 dark:to-green-200">Campus Moments</span>
            </h2>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              A glimpse into the memorable events, activities, and experiences at UCAES. Our students and faculty participate in various academic, cultural, and professional development activities.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/10 py-16 px-4 sm:px-8 rounded-3xl shadow-inner">
              <PhotoGalleryFiltered />
            </div>
          </div>
        </div>
      </section>

      {/* Student Life Highlights */}
      <section className="py-24 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-1.5 text-base bg-green-700 text-white">Student Experience</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Life at UCAES</h2>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our campus offers a rich and diverse experience that helps students grow academically, professionally, and personally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800">
              <div className="h-3 w-full bg-green-600"></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Student Organizations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Join one of our many student organizations to connect with peers who share your interests and develop leadership skills.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">Gayo: Green Africa Youth Organisation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">A Rocha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">Tein: Tertiary Education Institutions Network of the National Democratic Congress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">Tescon: Tertiary Students Confederacy for the New Patriotic Party</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">Essa: Environmental Science Student’s Association</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">Assa: Agriculture Science Student’s Association</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm">Debaters club</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800">
              <div className="h-3 w-full bg-amber-500"></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle>Campus Events</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our calendar is filled with academic, cultural, and social events that enrich the campus experience throughout the year.
                </p>
                <div className="space-y-2">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">Annual Agricultural Fair</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">Annual</Badge>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">Environmental Awareness Week</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">Semester</Badge>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">Cultural Festival</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">Annual</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800">
              <div className="h-3 w-full bg-blue-600"></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Student Achievements</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our students excel in various fields, from academic competitions to research innovations and community service.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15+</div>
                    <p className="text-sm text-muted-foreground">National Awards</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">30+</div>
                    <p className="text-sm text-muted-foreground">Research Papers</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">95%</div>
                    <p className="text-sm text-muted-foreground">Employment Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Campus Activities */}
      <section className="py-24 bg-gradient-to-b from-white to-green-50 dark:from-transparent dark:to-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="px-4 py-1.5 text-base bg-green-700 text-white mb-6">Activities & Programs</Badge>
              <h2 className="text-4xl font-bold tracking-tight mb-6">Enriching Campus Activities</h2>
              <div className="w-20 h-1.5 bg-green-600 rounded-full mb-6"></div>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                UCAES offers a wide range of extracurricular activities that complement academic learning and help students develop important life skills.
              </p>
              
              <div className="space-y-8">
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-600 flex items-start gap-6 group">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-green-800 dark:text-green-400">Agricultural Projects</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Hands-on experience with sustainable farming practices and agricultural innovation projects. Students participate in field work, research, and community farming initiatives.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-600 flex items-start gap-6 group">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-blue-800 dark:text-blue-400">Cultural Programs</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Celebrating Ghana's rich cultural heritage through music, dance, and traditional ceremonies. Our cultural programs foster appreciation for diversity and national identity.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-amber-600 flex items-start gap-6 group">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Heart className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-amber-800 dark:text-amber-400">Community Service</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Giving back to local communities through volunteer work and environmental conservation efforts. Students develop leadership skills while making a positive impact on society.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl group">
                <img 
                  src="/images/photos/photo13.jpg" 
                  alt="UCAES Agricultural Training" 
                  className="w-full group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 group hover:rotate-2 transition-transform duration-300">
                <img 
                  src="/images/photos/photo14.jpg" 
                  alt="UCAES Student Presentation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-semibold">Student Presentations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
} 