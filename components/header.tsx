"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  
  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out');
    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white border-b">
      <div className="flex items-center">
        <div className="mr-2 bg-green-600 text-white p-2 rounded">
          <span className="text-xl font-bold">U</span>
        </div>
        <div>
          <h1 className="text-green-600 font-bold text-lg">UCAES Admin Portal</h1>
          <p className="text-gray-500 text-sm">University College of Agriculture & Environmental Studies</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {}} 
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        
        <button 
          onClick={() => {}} 
          className="p-2 rounded-full hover:bg-gray-100 relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">3</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            SA
          </div>
          <div>
            <p className="font-medium text-sm">Super Admin</p>
            <p className="text-gray-500 text-xs">System Administrator</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 