import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-green-700 rounded-lg">
                <GraduationCap className="h-6 w-6 text-amber-100" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-700">UCAES</h3>
                <p className="text-xs text-muted-foreground">Conservation, Preservation, Food security and Education</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              University College of Agriculture and Environmental Studies - A leading institution in the teaching, researching, and practice of sustainable agriculture and environmental sustainability.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="hover:text-green-700" asChild>
                <a href="https://www.facebook.com/UCAESedu" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="hover:text-green-700">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/academics" className="text-muted-foreground hover:text-primary transition-colors">
                  Academic Programs
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-muted-foreground hover:text-primary transition-colors">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/student-life" className="text-muted-foreground hover:text-primary transition-colors">
                  Student Life
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground hover:text-primary transition-colors">
                  News & Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Faculties */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Academic Faculties</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/academics#agriculture" className="text-muted-foreground hover:text-green-700 transition-colors">
                  Faculty of Agriculture and Rural Development
                </Link>
              </li>
              <li>
                <Link href="/academics#environmental" className="text-muted-foreground hover:text-green-700 transition-colors">
                  Faculty of Environment and Conservation
                </Link>
              </li>
              <li>
                <Link href="/academics#research" className="text-muted-foreground hover:text-green-700 transition-colors">
                  Research & Partnerships
                </Link>
              </li>
              <li>
                <Link href="/academics#facilities" className="text-muted-foreground hover:text-green-700 transition-colors">
                  Campus Facilities
                </Link>
              </li>
              <li>
                <Link href="/academics#calendar" className="text-muted-foreground hover:text-green-700 transition-colors">
                  Academic Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact & Updates</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-700" />
                <span className="text-muted-foreground">University College of Agriculture and Environmental Studies, P.O. Box 27, Bunso, Eastern Region, Ghana</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-700" />
                <span className="text-muted-foreground">+233 (0) 54 124 7178</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-700" />
                <span className="text-muted-foreground">info@ucaes.edu.gh</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-xs font-medium">Subscribe to Newsletter</h5>
              <div className="flex space-x-2">
                <Input placeholder="Your email" className="text-xs" />
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 University College of Agriculture and Environmental Studies. Founded 2006. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Use
            </Link>
            <Link href="/accessibility" className="text-muted-foreground hover:text-primary transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}