"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, ChevronRight } from 'lucide-react';

export function AdmissionBanner() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center">
      <Card className="border-0 shadow-2xl overflow-hidden w-full max-w-4xl bg-white dark:bg-gray-900">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left side - Logo and Title */}
            <div className="bg-gradient-to-br from-green-700 to-green-900 text-white p-6 flex flex-col justify-center items-center text-center">
              <img 
                src="/images/logo.png" 
                alt="UCAES Logo" 
                className="h-16 mb-4"
              />
              <h3 className="text-xl font-bold">UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES</h3>
              <p className="text-sm mt-2">BUNSO EASTERN REGION, GHANA</p>
              <p className="text-xs mt-1 text-green-200">AFFILIATED TO KNUST | ACCREDITED BY GTEC</p>
            </div>

            {/* Right side - Admission Info */}
            <div className="md:col-span-2 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-green-700 text-white mb-2">Admission Open</Badge>
                  <h2 className="text-3xl font-bold text-green-800 dark:text-green-400">2024/2025</h2>
                  <h3 className="text-2xl font-bold italic text-green-700 dark:text-green-500 mb-4">Admission in progress</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-500 mb-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-md">DEGREE PROGRAMS</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>BSc. Sustainable Agriculture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>BSc. Environmental Science & Management</span>
                    </li>
                  </ul>

                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-500 mt-4 mb-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-md">DIPLOMA PROGRAM</h4>
                  <p className="font-medium">Diploma in Organic Agriculture</p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-500 mb-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-md">CERTIFICATE PROGRAMS</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>Sustainable Agriculture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>Waste Management & Environmental health</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>Public Health</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Contact us:</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-green-700" />
                        <span>0500342659</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-green-700" />
                        <span>0245809402</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-green-700" />
                        <span>0246223760</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-green-700" />
                        <span>0541247178</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="bg-green-700 hover:bg-green-800">
                    <Link href="/apply">
                      Apply Now
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-center text-sm text-green-700 dark:text-green-500 mt-4 font-medium">
                  WHATSAPP US FOR OUR FORMS ON 0541247178
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
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