"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle,
  Calendar,
  ClipboardList,
  GraduationCap,
  FileText,
  CreditCard,
  Users,
  ExternalLink,
  Mail,
  Phone,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

const documents = [
  { name: "Passport", required: true, description: "Valid international passport with at least 6 months validity" },
  { name: "Proof of fee payment", required: true, description: "Receipt of application fee payment" },
  { name: "TOEFL Certificate", required: false, description: "For international students from non-English speaking countries" },
  { name: "Application fee", required: true, description: "Non-refundable application processing fee" },
  { name: "Declaration for financial support", required: true, description: "Proof of financial capability to fund your studies" },
  { name: "IELTS Certificate", required: false, description: "Alternative English proficiency proof for international students" },
  { name: "Photographs", required: true, description: "Recent passport-sized photographs with white background" },
  { name: "Student visa", required: false, description: "For international students (can be obtained after acceptance)" },
  { name: "Health and Life Insurance", required: true, description: "Valid health insurance coverage for duration of study" },
  { name: "Research proposal outline", required: false, description: "Required for MA and PhD applicants only" },
  { name: "Online Application form", required: true, description: "Completed application form from our admissions portal" },
];

const programs = [
  {
    faculty: "Faculty of Agriculture and Rural Development",
    degrees: [
      "BSc Agricultural Science",
      "BSc Agribusiness Management",
      "BSc Crop Science",
      "Diploma in Sustainable Agriculture",
      "Certificate in Agricultural Practice"
    ]
  },
  {
    faculty: "Faculty of Environment and Conservation",
    degrees: [
      "BSc Environmental Science",
      "BSc Natural Resource Management",
      "BSc Waste Management",
      "Diploma in Environmental Conservation",
      "Certificate in Environmental Studies"
    ]
  }
];

const applicationSteps = [
  {
    title: "Research Programs",
    description: "Explore our academic programs to find the right fit for your interests and career goals."
  },
  {
    title: "Check Requirements",
    description: "Ensure you meet the admission requirements for your chosen program."
  },
  {
    title: "Prepare Documents",
    description: "Gather all required documents including academic certificates and identification."
  },
  {
    title: "Submit Online Application",
    description: "Complete and submit the online application form with all required documents."
  },
  {
    title: "Pay Application Fee",
    description: "Pay the non-refundable application processing fee to complete your submission."
  },
  {
    title: "Admission Decision",
    description: "Wait for the admission committee to review your application and make a decision."
  }
];

const applicationPeriods = [
  { session: "January Intake", open: "October 1", close: "November 30", notification: "December 15" },
  { session: "September Intake", open: "May 1", close: "July 31", notification: "August 15" }
];

export default function ApplyPage() {
  const [selectedTab, setSelectedTab] = useState("process");

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative">
        {/* Banner Image */}
        <div className="relative h-[300px] w-full">
          <img
            src="/images/bunner/application.jpg"
            alt="Apply to UCAES"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto animate-fade-in text-white">
              <Badge variant="secondary" className="mb-4 bg-green-700 text-white">Admissions</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Apply to UCAES
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Start your journey towards becoming a leader in sustainable agriculture and environmental conservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Status Notice */}
      <section className="py-8 bg-yellow-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-800">Applications are currently closed</h2>
              <p className="text-muted-foreground">
                Please check back later or contact the admissions office for information about upcoming application periods.
              </p>
            </div>
            <div className="md:ml-auto">
              <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Link href="#contact-section">
                  Contact Admissions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="process" className="mb-12" onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="process">Application Process</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="programs">Programs</TabsTrigger>
                <TabsTrigger value="fees">Fees & Deadlines</TabsTrigger>
              </TabsList>
              
              <TabsContent value="process" className="mt-6 animate-fade-in space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">How to Apply</h2>
                  <p className="text-muted-foreground">Follow these steps to apply to University College of Agriculture and Environmental Studies</p>
                </div>
                
                <div className="space-y-6">
                  {applicationSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Track Your Application</h3>
                        <p className="text-muted-foreground mb-4">
                          Once you've submitted your application, you can track its status through our applicant portal.
                        </p>
                        <Button className="bg-green-700 hover:bg-green-800 text-white">
                          Check Application Status
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requirements" className="mt-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Application Requirements</h2>
                  <p className="text-muted-foreground">Ensure you meet these requirements before applying</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-green-700" />
                      Academic Requirements
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Check className="mt-1 h-4 w-4 text-green-700 flex-shrink-0" />
                        <p>For <strong>Undergraduate Programs:</strong> WASSCE or equivalent with at least C6 in English, Mathematics, and three relevant Science subjects.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-1 h-4 w-4 text-green-700 flex-shrink-0" />
                        <p>For <strong>Postgraduate Programs:</strong> Bachelor's degree with at least second class lower division in a relevant field.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-1 h-4 w-4 text-green-700 flex-shrink-0" />
                        <p>For <strong>International Students:</strong> Equivalent qualifications must be verified by the National Accreditation Board of Ghana.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-green-700" />
                      Required Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc, index) => (
                        <Card key={index} className={`hover:shadow-md transition-all duration-300 border-l-4 ${
                          doc.required ? 'border-green-600' : 'border-amber-400'
                        }`}>
                          <CardContent className="p-4 flex items-start gap-3">
                            <FileCheck className="h-5 w-5 text-green-700 mt-1 flex-shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{doc.name}</h4>
                                {doc.required ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Required</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">If Applicable</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="programs" className="mt-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Available Programs</h2>
                  <p className="text-muted-foreground">Explore our range of academic programs</p>
                </div>
                
                <div className="space-y-8">
                  {programs.map((faculty, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-green-700 mb-4">{faculty.faculty}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {faculty.degrees.map((degree, degIndex) => (
                            <div key={degIndex} className="flex items-start gap-2">
                              <Check className="mt-1 h-4 w-4 text-green-700 flex-shrink-0" />
                              <span>{degree}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
                      <Link href="/academics">
                        View Detailed Program Information
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="fees" className="mt-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Fees & Application Deadlines</h2>
                  <p className="text-muted-foreground">Information about costs and important dates</p>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-green-700" />
                      Application Fees
                    </h3>
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <h4 className="font-semibold">Ghanaian Citizens</h4>
                            <p className="text-2xl font-bold text-green-700 my-2">GHS 100</p>
                            <p className="text-sm text-muted-foreground">Non-refundable application fee</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <h4 className="font-semibold">International Students</h4>
                            <p className="text-2xl font-bold text-green-700 my-2">USD 50</p>
                            <p className="text-sm text-muted-foreground">Non-refundable application fee</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-green-700" />
                      Application Periods
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="py-3 px-4 text-left font-semibold border-b">Intake Session</th>
                            <th className="py-3 px-4 text-left font-semibold border-b">Applications Open</th>
                            <th className="py-3 px-4 text-left font-semibold border-b">Applications Close</th>
                            <th className="py-3 px-4 text-left font-semibold border-b">Decision Notification</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicationPeriods.map((period, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/10'}>
                              <td className="py-3 px-4 border-b">{period.session}</td>
                              <td className="py-3 px-4 border-b">{period.open}</td>
                              <td className="py-3 px-4 border-b">{period.close}</td>
                              <td className="py-3 px-4 border-b">{period.notification}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Tuition & Scholarships</h3>
                          <p className="text-muted-foreground mb-4">
                            For detailed information about tuition fees and available scholarships, please visit our fees and financial aid page.
                          </p>
                          <Button asChild variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-50">
                            <Link href="/admissions#fees">
                              View Tuition & Financial Aid
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Contact Admissions Office</h2>
            <p className="text-muted-foreground">Have questions about the application process? Our admissions team is here to help.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <Mail className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">admissions@ucaes.edu.gh</p>
                <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-50 w-full">
                  <a href="mailto:admissions@ucaes.edu.gh">
                    Send Email
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground mb-4">+233 (0) 54 124 7178</p>
                <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-50 w-full">
                  <a href="tel:+233541247178">
                    Call Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <ClipboardList className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold mb-2">FAQ</h3>
                <p className="text-muted-foreground mb-4">Find answers to common questions</p>
                <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-50 w-full">
                  <Link href="/admissions#faq">
                    View FAQs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              Office Hours: Monday to Friday, 8:00 AM - 5:00 PM GMT
            </p>
            <Button asChild size="lg" className="bg-green-700 hover:bg-green-800 text-white">
              <Link href="/contact">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}