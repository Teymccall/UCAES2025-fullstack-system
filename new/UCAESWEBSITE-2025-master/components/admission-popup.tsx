"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function AdmissionPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-2xl animate-fade-in">
        <div className="relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left side - Green background with logo */}
            <div className="bg-green-700 p-10 flex flex-col items-center justify-center text-center text-white">
              <img 
                src="/images/logo.png" 
                alt="UCAES Logo" 
                className="h-24 mb-4"
              />
              <h3 className="text-xl font-bold">UNIVERSITY COLLEGE OF AGRICULTURE AND ENVIRONMENTAL STUDIES</h3>
              <p className="text-sm mt-2">BUNSO EASTERN REGION, GHANA</p>
              <p className="text-xs mt-1 text-green-200">AFFILIATED TO KNUST | ACCREDITED BY GTEC</p>
            </div>

            {/* Right side - Admission details */}
            <div className="md:col-span-2 p-6">
              <div className="mb-6">
                <div className="inline-block bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium mb-2">
                  Admission Open
                </div>
                <h2 className="text-4xl font-bold text-green-800 mb-1">2024/2025</h2>
                <h3 className="text-2xl font-bold italic text-green-700">Admission in progress</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold text-amber-800 mb-4 bg-amber-100 px-3 py-1 rounded-md text-center">
                    DEGREE PROGRAMS
                  </h4>
                  <ul className="space-y-3 pl-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>BSc. Sustainable Agriculture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>BSc. Environmental Science & Management</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-amber-800 mb-4 bg-amber-100 px-3 py-1 rounded-md text-center">
                    CERTIFICATE PROGRAMS
                  </h4>
                  <ul className="space-y-3 pl-2">
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

              <div className="mt-6">
                <h4 className="text-lg font-bold text-amber-800 mb-4 bg-amber-100 px-3 py-1 rounded-md text-center">
                  DIPLOMA PROGRAM
                </h4>
                <div className="pl-2">
                  <div className="flex items-center gap-2">
                    <CheckIcon />
                    <span>Diploma in Organic Agriculture</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold mb-2">Contact us:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-green-700">📞</span> 0500342659
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-700">📞</span> 0245809402
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-700">📞</span> 0246223760
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-700">📞</span> 0541247178
                  </div>
                </div>
                <p className="text-center text-green-700 font-medium mb-6">
                  WHATSAPP US FOR OUR FORMS ON 0541247178
                </p>
                <div className="flex justify-center">
                  <Button asChild className="bg-green-700 hover:bg-green-800 px-8 py-2 text-lg">
                    <Link href="/apply">Apply Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      className="text-green-700"
    >
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  );
} 