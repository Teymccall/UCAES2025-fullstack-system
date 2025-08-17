"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  Users,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  MapPin
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">Legal Information</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Terms of Use
            </h1>
            <p className="text-lg text-muted-foreground">
              Please read these terms and conditions carefully before using our website and services.
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
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-primary" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                By accessing and using the University College of Agriculture and Environmental Studies (UCAES) website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Use constitute a legally binding agreement between you and UCAES. Your access to and use of our website and services is conditioned on your acceptance of and compliance with these terms.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Use License</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Permitted Uses</h3>
                <p className="text-muted-foreground mb-3">
                  Permission is granted to temporarily access and use our website for personal, non-commercial transitory viewing only. This includes:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Browsing information about our programs and services</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Submitting applications and required documents</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Accessing student portals and authorized content</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Downloading publicly available resources</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Prohibited Uses</h3>
                <p className="text-muted-foreground mb-3">
                  Under this license you may not:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Modify or copy the materials</li>
                  <li>• Use the materials for any commercial purpose or for any public display</li>
                  <li>• Attempt to reverse engineer any software contained on the website</li>
                  <li>• Remove any copyright or other proprietary notations from the materials</li>
                  <li>• Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>User Accounts and Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Creation</h3>
                <p className="text-muted-foreground">
                  To access certain features of our services, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Account Security</h3>
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">Important Security Notice</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                        You are responsible for safeguarding your account credentials and for all activities that occur under your account. 
                        Notify us immediately of any unauthorized use of your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">User Conduct</h3>
                <p className="text-muted-foreground mb-3">You agree not to:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use the service for any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>• Violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>• Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>• Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>• Submit false or misleading information</li>
                  <li>• Upload viruses or any other type of malicious code</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Academic Services */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Services and Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Application Process</h3>
                <p className="text-muted-foreground">
                  By submitting an application through our website, you acknowledge that all information provided is true and accurate to the best of your knowledge. False or misleading information may result in rejection of your application or termination of enrollment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Fees and Payments</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Application fees are non-refundable unless otherwise specified</li>
                  <li>• Tuition and other fees are subject to change with appropriate notice</li>
                  <li>• Payment terms and conditions are outlined in separate fee schedules</li>
                  <li>• Failure to pay fees may result in suspension of services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Academic Integrity</h3>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    All students are expected to maintain the highest standards of academic integrity. 
                    Plagiarism, cheating, and other forms of academic dishonesty will not be tolerated and may result in disciplinary action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">UCAES Content</h3>
                <p className="text-muted-foreground">
                  The service and its original content, features, and functionality are and will remain the exclusive property of UCAES and its licensors. 
                  The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">User Content</h3>
                <p className="text-muted-foreground">
                  By submitting content to our service (including applications, documents, and communications), you grant UCAES a non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, and display such content for educational and administrative purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Privacy and Data Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. 
                By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive to maintain continuous service availability but cannot guarantee uninterrupted access. 
                  The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Information Accuracy</h3>
                <p className="text-muted-foreground">
                  While we make every effort to ensure the accuracy of information on our website, we cannot guarantee that all information is current, complete, or error-free. 
                  Program requirements, fees, and policies are subject to change.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Third-Party Links</h3>
                <p className="text-muted-foreground">
                  Our service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party websites or services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
              </p>
              <p className="text-muted-foreground">
                If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These Terms shall be interpreted and governed by the laws of Ghana, without regard to its conflict of law provisions. 
                Any disputes arising from these terms or your use of the service shall be subject to the exclusive jurisdiction of the courts of Ghana.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  What constitutes a material change will be determined at our sole discretion. 
                  Your continued use of the service after any changes indicates your acceptance of the new Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions or concerns about these Terms of Use, please contact:
              </p>
              
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}