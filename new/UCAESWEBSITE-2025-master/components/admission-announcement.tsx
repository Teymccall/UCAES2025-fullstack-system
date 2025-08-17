"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, ArrowRight } from 'lucide-react';

export function AdmissionAnnouncement() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-xl overflow-hidden bg-white dark:bg-gray-900">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Header */}
              <div className="lg:col-span-5 bg-green-800 text-white p-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <img 
                    src="/images/logo.png" 
                    alt="UCAES Logo" 
                    className="h-16"
                  />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES</h2>
                    <p className="text-sm mt-1">BUNSO EASTERN REGION, GHANA</p>
                    <p className="text-xs mt-1 text-green-200">AFFILIATED TO KNUST | ACCREDITED BY GTEC</p>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden">
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 opacity-15">
                    <img 
                      src="/images/photos/photo1.jpg" 
                      alt="UCAES Students" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-8 md:p-12">
                    <div className="text-center mb-12">
                      <Badge className="bg-green-700 text-white mb-4 px-4 py-1 text-lg">Admission Open</Badge>
                      <h2 className="text-5xl md:text-7xl font-bold text-green-800 dark:text-green-400 mb-2">2024/2025</h2>
                      <h3 className="text-3xl md:text-4xl font-bold italic text-green-700 dark:text-green-500">
                        Admission in progress
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Degree Programs */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h4 className="text-xl font-bold text-amber-800 dark:text-amber-500 mb-4 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-md text-center">
                          DEGREE PROGRAMS
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <CheckIcon />
                            <span className="font-medium">BSc. Sustainable Agriculture</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon />
                            <span className="font-medium">BSc. Environmental Science & Management</span>
                          </li>
                        </ul>
                      </div>

                      {/* Diploma Program */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h4 className="text-xl font-bold text-amber-800 dark:text-amber-500 mb-4 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-md text-center">
                          DIPLOMA PROGRAM
                        </h4>
                        <div className="flex items-center gap-2 mt-8">
                          <CheckIcon />
                          <span className="font-medium">Diploma in Organic Agriculture</span>
                        </div>
                      </div>

                      {/* Certificate Programs */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h4 className="text-xl font-bold text-amber-800 dark:text-amber-500 mb-4 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-md text-center">
                          CERTIFICATE PROGRAMS
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <CheckIcon />
                            <span className="font-medium">Sustainable Agriculture</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon />
                            <span className="font-medium">Waste Management & Environmental Health</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckIcon />
                            <span className="font-medium">Public Health</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="lg:col-span-2">
                          <h4 className="text-xl font-bold text-green-800 dark:text-green-400 mb-4">Contact us for more information:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <PhoneCall className="h-5 w-5 text-green-700" />
                              <span className="font-medium">0500342659</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <PhoneCall className="h-5 w-5 text-green-700" />
                              <span className="font-medium">0245809402</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <PhoneCall className="h-5 w-5 text-green-700" />
                              <span className="font-medium">0246223760</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <PhoneCall className="h-5 w-5 text-green-700" />
                              <span className="font-medium">0541247178</span>
                            </div>
                          </div>
                          <p className="text-center text-green-700 dark:text-green-500 mt-6 font-bold">
                            WHATSAPP US FOR OUR FORMS ON 0541247178
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-lg h-14 px-8">
                            <Link href="/apply">
                              Apply Now
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-green-700 dark:text-green-500"
    >
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  );
} 