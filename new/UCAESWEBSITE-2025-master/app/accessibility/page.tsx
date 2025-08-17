"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye,
  Ear,
  MousePointer,
  Keyboard,
  Monitor,
  Smartphone,
  Users,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Settings,
  Volume2,
  MapPin,
  Info
} from 'lucide-react';
import { useState } from 'react';

export default function AccessibilityPage() {
  const [showWatermark, setShowWatermark] = useState(false);
  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto relative">
            <Badge variant="secondary" className="mb-4">Accessibility</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Accessibility Statement
            </h1>
            <p className="text-lg text-muted-foreground">
              UCAES is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone.
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: January 1, 2025</span>
            </div>
            {/* Watermark Icon */}
            <button
              className="absolute top-4 right-4 opacity-30 hover:opacity-80 transition-opacity"
              style={{ outline: 'none' }}
              aria-label="Show watermark"
              onClick={() => setShowWatermark((v) => !v)}
            >
              <Info className="h-5 w-5" />
            </button>
            {showWatermark && (
              <div className="absolute top-10 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-2 text-xs text-gray-700 dark:text-gray-200 z-50 animate-fade-in">
                This is my watermark. <br />Developed by Hanamel Achumboro Awenatey.
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Commitment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Our Commitment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                The University College of Agriculture and Environmental Studies (UCAES) is committed to ensuring that our website and digital services are accessible to all users, including those with disabilities. We believe that everyone should have equal access to information and functionality, regardless of their abilities or the technologies they use.
              </p>
              <p>
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards and continuously work to improve the accessibility of our digital platforms.
              </p>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Our website includes the following accessibility features:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Eye className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Visual Accessibility</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                        <li>• High contrast color schemes</li>
                        <li>• Scalable text and images</li>
                        <li>• Alternative text for images</li>
                        <li>• Clear visual hierarchy</li>
                        <li>• Focus indicators for navigation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Keyboard className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Keyboard Navigation</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                        <li>• Full keyboard accessibility</li>
                        <li>• Logical tab order</li>
                        <li>• Skip navigation links</li>
                        <li>• Keyboard shortcuts</li>
                        <li>• No keyboard traps</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Volume2 className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Audio & Media</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                        <li>• Captions for videos</li>
                        <li>• Audio descriptions</li>
                        <li>• Transcript availability</li>
                        <li>• Volume controls</li>
                        <li>• Auto-play prevention</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Monitor className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Screen Reader Support</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                        <li>• Semantic HTML structure</li>
                        <li>• ARIA labels and descriptions</li>
                        <li>• Proper heading hierarchy</li>
                        <li>• Form labels and instructions</li>
                        <li>• Status announcements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-primary" />
                <span>Browser & Device Compatibility</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our website is designed to work with the following assistive technologies and browsers:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Supported Browsers</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Chrome (latest 2 versions)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Firefox (latest 2 versions)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Safari (latest 2 versions)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Edge (latest 2 versions)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Assistive Technologies</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>JAWS (Windows)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>NVDA (Windows)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>VoiceOver (macOS/iOS)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>TalkBack (Android)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Accessibility Tools & Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You can customize your browsing experience using these built-in accessibility features:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Browser Settings</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Zoom in/out (Ctrl/Cmd + or -)</li>
                    <li>• Increase text size in browser settings</li>
                    <li>• Enable high contrast mode</li>
                    <li>• Turn off animations and auto-play</li>
                    <li>• Use browser's reading mode</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Operating System</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Screen reader software</li>
                    <li>• Voice recognition software</li>
                    <li>• On-screen keyboard</li>
                    <li>• Mouse alternatives</li>
                    <li>• Color filters and contrast</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Need Help?</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      If you need assistance with accessibility settings or encounter any barriers, please contact our support team.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Known Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Known Issues & Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We are continuously working to improve accessibility. Currently known issues include:
              </p>

              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">Third-Party Content</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                        Some embedded content from third-party providers may not fully meet accessibility standards. 
                        We are working with these providers to improve accessibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">PDF Documents</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                        Some older PDF documents may not be fully accessible. We are working to update these documents 
                        and provide alternative formats upon request.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle>Contact and Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We welcome your feedback on the accessibility of our website. If you encounter any barriers or have suggestions for improvement, please contact us:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>Email: info@ucaes.edu.gh</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>Phone: +233 (0) 54 124 7178</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Address: University College of Agriculture and Environmental Studies, P.O. Box 27, Bunso, Eastern Region, Ghana</span>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Help Us Improve</h3>
                  <p className="text-sm text-muted-foreground">
                    We are committed to making our website accessible for all users. Your feedback helps us identify and address accessibility barriers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standards Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Standards & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our website aims to comply with the following accessibility standards and guidelines:
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Section 508 of the Rehabilitation Act</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">EN 301 549 European Standard</span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-200">
                  This website was last tested for accessibility compliance on March 1, 2024, using automated tools and manual testing methods.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We are committed to continuously improving the accessibility of our website. Our ongoing efforts include:
              </p>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Regular accessibility audits and testing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Staff training on accessibility best practices</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>User testing with people with disabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Implementation of new accessibility features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Regular updates to this accessibility statement</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}