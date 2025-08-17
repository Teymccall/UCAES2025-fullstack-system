"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Sun, 
  Moon, 
  ChevronDown,
  Globe,
  X,
  Home,
  Info,
  BookOpen,
  UserCheck,
  Users,
  Users2,
  Newspaper,
  Phone,
  Search,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Navigation structure that matches existing pages
const navigation = [
  { name: 'Home', href: '/', icon: Home, hasDropdown: false },
  { name: 'About', href: '/about', icon: Info, hasDropdown: false },
  { name: 'Academics', href: '/academics', icon: BookOpen, hasDropdown: false },
  { name: 'Admissions', href: '/admissions', icon: UserCheck, hasDropdown: false },
  { name: 'Campus Life', href: '/campus-life', icon: Users2, hasDropdown: false },
  { name: 'Apply', href: '/apply', icon: Users, hasDropdown: false },
  { name: 'Contact', href: '/contact', icon: Phone, hasDropdown: false },
];

// Footer links for additional pages
const footerLinks = [
  { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  { name: 'Terms', href: '/terms', icon: Shield },
  { name: 'Accessibility', href: '/accessibility', icon: Users },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-sm' : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden">
                <Image 
                  src="/images/uces.png" 
                  alt="UCAES Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              <div className="ml-2">
                <h1 className="text-xl font-bold text-green-700">
                  UCAES
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation - Using actual pages */}
            <div className="hidden lg:flex items-center">
              <nav className="flex space-x-4">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-green-700 hover:text-green-600 px-2"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Side Actions - Consolidated */}
            <div className="flex items-center space-x-3">
              {/* Language & Theme in one dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex p-1">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs ml-1">EN</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <span className="text-sm">🇺🇸</span>
                    <span>English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <span className="text-sm">🇬🇭</span>
                    <span>Twi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center space-x-2">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1" 
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Apply Button */}
              <Link href="/apply">
                <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white rounded-full px-4 text-xs hidden sm:flex">
                  Apply Now
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-1">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="relative h-8 w-8 overflow-hidden">
                        <Image 
                          src="/images/uces.png" 
                          alt="UCAES Logo" 
                          width={32} 
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-green-700">UCAES</h2>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    {navigation.map((item) => (
                      <div key={item.name} className="border-b border-gray-100">
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-3 text-base font-medium text-green-700"
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                    
                    <div className="pt-4 mt-2 space-y-3">
                      <Link href="/apply" className="block">
                        <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white w-full">
                          Apply Now
                        </Button>
                      </Link>
                      
                      {/* Footer Links in Mobile Menu */}
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <p className="text-xs text-gray-500 mb-2">Additional Links</p>
                        {footerLinks.map((item) => (
                          <div key={item.name} className="mb-2">
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <item.icon className="h-4 w-4 mr-2" />
                              <span>{item.name}</span>
                            </Link>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center bg-amber-400 rounded-full overflow-hidden w-full">
                        <input 
                          type="text" 
                          placeholder="Search" 
                          className="bg-transparent border-none px-3 py-1 text-sm text-green-800 placeholder-green-700/70 focus:outline-none flex-1"
                        />
                        <button className="bg-amber-400 px-2 py-1 text-green-800">
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Expandable Search Bar */}
          {showSearch && (
            <div className="py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden w-full">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none px-4 py-2 text-green-800 dark:text-amber-100 placeholder-green-700/70 dark:placeholder-amber-100/70 focus:outline-none flex-1"
                  autoFocus
                />
                <button className="px-3 py-2 text-green-800 dark:text-amber-100">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}