"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield,
  Eye,
  Lock,
  Users,
  Mail,
  Phone,
  Calendar,
  FileText,
  MapPin
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">Legal Information</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: January 1, 2025</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                The University College of Agriculture and Environmental Studies (UCAES) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, apply for admission, or interact with our services.
              </p>
              <p>
                By using our website or services, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our website or services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <p className="text-muted-foreground mb-3">
                  We may collect personal information that you voluntarily provide to us, including:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Name, address, phone number, and email address</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Academic records, transcripts, and certificates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Date of birth, nationality, and gender</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Application materials and supporting documents</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Emergency contact information</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Automatically Collected Information</h3>
                <p className="text-muted-foreground mb-3">
                  When you visit our website, we may automatically collect certain information:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• IP address and browser information</li>
                  <li>• Pages visited and time spent on our website</li>
                  <li>• Referring website or search terms used</li>
                  <li>• Device information and operating system</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Academic Services</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Processing applications and admissions</li>
                    <li>• Providing educational services</li>
                    <li>• Maintaining academic records</li>
                    <li>• Issuing certificates and transcripts</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Communication</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sending important notifications</li>
                    <li>• Responding to inquiries</li>
                    <li>• Marketing and promotional materials</li>
                    <li>• Alumni relations and updates</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Administration</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Managing student accounts</li>
                    <li>• Processing payments and fees</li>
                    <li>• Compliance with legal requirements</li>
                    <li>• Statistical analysis and reporting</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Website Improvement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Analyzing website usage patterns</li>
                    <li>• Improving user experience</li>
                    <li>• Personalizing content</li>
                    <li>• Technical maintenance and security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Authorized Disclosures</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                    <li>• Government agencies for regulatory compliance</li>
                    <li>• Accreditation bodies for quality assurance</li>
                    <li>• Partner institutions for academic collaborations</li>
                    <li>• Service providers who assist in our operations</li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Legal Requirements</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    We may disclose your information when required by law, court order, or government regulation, or when we believe disclosure is necessary to protect our rights, property, or safety, or that of others.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Technical Safeguards</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SSL encryption for data transmission</li>
                    <li>• Secure servers and databases</li>
                    <li>• Regular security updates and patches</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Administrative Safeguards</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Staff training on data protection</li>
                    <li>• Limited access on need-to-know basis</li>
                    <li>• Regular security audits and assessments</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have certain rights regarding your personal information:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Access and Correction</h4>
                    <p className="text-sm text-muted-foreground">You can request access to your personal information and ask us to correct any inaccuracies.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Data Portability</h4>
                    <p className="text-sm text-muted-foreground">You can request a copy of your personal information in a structured, machine-readable format.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Marketing Communications</h4>
                    <p className="text-sm text-muted-foreground">You can opt out of receiving marketing communications at any time.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Data Retention</h4>
                    <p className="text-sm text-muted-foreground">We retain your information only as long as necessary for the purposes outlined in this policy.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your browsing experience and analyze website usage.
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Types of Cookies We Use</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• <strong>Essential Cookies:</strong> Necessary for website functionality</li>
                    <li>• <strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                    <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    <li>• <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Data Protection Officer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>info@ucaes.edu.gh</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+233 (0) 54 124 7178</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>University College of Agriculture and Environmental Studies, P.O. Box 27, Bunso, Eastern Region, Ghana</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of our services after any changes indicates your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}