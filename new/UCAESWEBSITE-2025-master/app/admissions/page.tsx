"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AdmissionAnnouncement } from '@/components/admission-announcement';
import { 
  GraduationCap,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  Award,
  Download,
  ExternalLink,
  ArrowRight,
  BookOpen,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Upload
} from 'lucide-react';

const admissionRequirements = {
  undergraduate: [
    {
      program: "BSc Agriculture",
      requirements: [
        "WASSCE with credits (C6 or better) in English Language",
        "Mathematics with credit (C6 or better)",
        "Chemistry with credit (C6 or better)",
        "Biology or Agricultural Science with credit (C6 or better)",
        "Any other science subject with credit",
        "Minimum aggregate of 24 or better"
      ],
      additionalInfo: "Applicants with HND in related fields may be considered for advanced standing."
    },
    {
      program: "BSc Environmental Science",
      requirements: [
        "WASSCE with credits (C6 or better) in English Language",
        "Mathematics with credit (C6 or better)",
        "Chemistry with credit (C6 or better)",
        "Biology or Physics with credit (C6 or better)",
        "Geography (preferred) with credit",
        "Minimum aggregate of 24 or better"
      ],
      additionalInfo: "Strong background in sciences is essential for this program."
    },
    {
      program: "BSc Agribusiness Management",
      requirements: [
        "WASSCE with credits (C6 or better) in English Language",
        "Mathematics with credit (C6 or better)",
        "Economics or Business Management with credit",
        "Any science subject with credit",
        "Social Studies with credit",
        "Minimum aggregate of 30 or better"
      ],
      additionalInfo: "Business-oriented subjects are highly recommended."
    }
  ],
  postgraduate: [
    {
      program: "MSc Agriculture (Various Specializations)",
      requirements: [
        "Bachelor's degree in Agriculture or related field",
        "Minimum Second Class Lower Division (2.5 CGPA)",
        "Two years relevant work experience (preferred)",
        "Two academic references",
        "Statement of purpose",
        "English proficiency (for international students)"
      ],
      additionalInfo: "Specializations include Crop Science, Animal Science, Soil Science, and Agricultural Economics."
    },
    {
      program: "MSc Environmental Science",
      requirements: [
        "Bachelor's degree in Environmental Science, Biology, Chemistry, or related field",
        "Minimum Second Class Lower Division (2.5 CGPA)",
        "Research proposal (1000 words)",
        "Two academic references",
        "Statement of purpose",
        "English proficiency (for international students)"
      ],
      additionalInfo: "Research component is mandatory for this program."
    }
  ]
};

const applicationProcess = [
  {
    step: 1,
    title: "Online Application",
    description: "Complete the online application form with personal and academic information",
    duration: "30 minutes",
    icon: FileText
  },
  {
    step: 2,
    title: "Document Submission",
    description: "Upload required documents including transcripts, certificates, and references",
    duration: "1-2 days",
    icon: Upload
  },
  {
    step: 3,
    title: "Application Fee Payment",
    description: "Pay the non-refundable application fee via mobile money or bank transfer",
    duration: "Immediate",
    icon: CreditCard
  },
  {
    step: 4,
    title: "Application Review",
    description: "Admissions committee reviews your application and supporting documents",
    duration: "2-4 weeks",
    icon: Clock
  },
  {
    step: 5,
    title: "Interview (if required)",
    description: "Selected candidates may be invited for an interview or entrance examination",
    duration: "1 day",
    icon: Users
  },
  {
    step: 6,
    title: "Admission Decision",
    description: "Receive admission decision via email and postal mail",
    duration: "1 week after review",
    icon: CheckCircle
  }
];

const importantDates = [
  {
    event: "Application Opens",
    date: "January 15, 2024",
    description: "Online applications begin for 2024/2025 academic year"
  },
  {
    event: "Early Application Deadline",
    date: "April 30, 2024",
    description: "Priority consideration for scholarships and accommodation"
  },
  {
    event: "Regular Application Deadline",
    date: "June 30, 2024",
    description: "Final deadline for undergraduate applications"
  },
  {
    event: "Postgraduate Application Deadline",
    date: "July 31, 2024",
    description: "Final deadline for postgraduate applications"
  },
  {
    event: "Admission Results",
    date: "August 15, 2024",
    description: "Admission decisions communicated to applicants"
  },
  {
    event: "Registration & Orientation",
    date: "September 2-6, 2024",
    description: "New student registration and orientation week"
  }
];

const fees = {
  application: {
    domestic: "GHS 200",
    international: "USD 50"
  },
  tuition: {
    undergraduate: {
      agriculture: "GHS 8,500/year",
      environmental: "GHS 9,000/year",
      agribusiness: "GHS 8,800/year"
    },
    postgraduate: {
      masters: "GHS 12,000/year",
      phd: "GHS 15,000/year"
    }
  },
  accommodation: {
    hostel: "GHS 2,500/year",
    apartment: "GHS 4,000/year"
  },
  other: {
    registration: "GHS 500",
    library: "GHS 200",
    sports: "GHS 150",
    medical: "GHS 300"
  }
};

const scholarships = [
  {
    name: "UCAES Merit Scholarship",
    amount: "50% tuition reduction",
    criteria: "Outstanding academic performance (Aggregate 6-12)",
    deadline: "April 30, 2024"
  },
  {
    name: "Agricultural Innovation Scholarship",
    amount: "Full tuition + stipend",
    criteria: "Exceptional students in agriculture with innovation projects",
    deadline: "March 31, 2024"
  },
  {
    name: "Need-Based Financial Aid",
    amount: "Up to 75% tuition reduction",
    criteria: "Demonstrated financial need with good academic standing",
    deadline: "May 15, 2024"
  },
  {
    name: "International Student Scholarship",
    amount: "25% tuition reduction",
    criteria: "International students with strong academic records",
    deadline: "June 1, 2024"
  }
];

const faqs = [
  {
    question: "What is the minimum qualification for undergraduate admission?",
    answer: "You need WASSCE with credits (C6 or better) in English, Mathematics, and relevant science subjects. The specific requirements vary by program."
  },
  {
    question: "Can I apply for multiple programs?",
    answer: "Yes, you can apply for up to 3 programs, but you'll need to pay separate application fees for each program."
  },
  {
    question: "Is there an age limit for admission?",
    answer: "There is no specific age limit. We welcome mature students who meet the academic requirements."
  },
  {
    question: "Do you accept HND holders?",
    answer: "Yes, HND holders with Upper Credit or Distinction may be considered for advanced standing in relevant programs."
  },
  {
    question: "What is the medium of instruction?",
    answer: "All programs are taught in English. International students may need to demonstrate English proficiency."
  },
  {
    question: "Are there part-time programs available?",
    answer: "Currently, we offer full-time programs only. However, we're developing part-time options for working professionals."
  },
  {
    question: "How do I check my application status?",
    answer: "You can check your application status through the online portal using your application ID and email address."
  },
  {
    question: "What happens if I miss the application deadline?",
    answer: "Late applications may be considered on a case-by-case basis, subject to available spaces and a late application fee."
  }
];

export default function AdmissionsPage() {
  const [selectedTab, setSelectedTab] = useState("requirements");

  return (
    <div className="pt-16">
      {/* Admission Announcement */}
      <AdmissionAnnouncement />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <Badge variant="secondary" className="mb-4">Admissions 2024/2025</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Join the UCAES Community
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Take the first step towards a rewarding career in agriculture and environmental sciences. 
              Our comprehensive admission process ensures we find the right fit for both students and programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Brochure
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Acceptance Rate</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">2-4</div>
                <div className="text-sm text-muted-foreground">Weeks Processing</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-sm text-muted-foreground">Programs Available</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">GHS 200</div>
                <div className="text-sm text-muted-foreground">Application Fee</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
              <TabsTrigger value="dates">Important Dates</TabsTrigger>
              <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Admission Requirements</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Review the specific requirements for your chosen program to ensure you meet all criteria before applying.
                  </p>
                </div>

                <Tabs defaultValue="undergraduate">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="undergraduate">Undergraduate</TabsTrigger>
                    <TabsTrigger value="postgraduate">Postgraduate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="undergraduate" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {admissionRequirements.undergraduate.map((program, index) => (
                        <Card key={index} className="h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <GraduationCap className="h-5 w-5 text-primary" />
                              <span>{program.program}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 mb-4">
                              {program.requirements.map((req, reqIndex) => (
                                <li key={reqIndex} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                              <p className="text-sm text-blue-700 dark:text-blue-200">
                                {program.additionalInfo}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="postgraduate" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {admissionRequirements.postgraduate.map((program, index) => (
                        <Card key={index} className="h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Award className="h-5 w-5 text-primary" />
                              <span>{program.program}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 mb-4">
                              {program.requirements.map((req, reqIndex) => (
                                <li key={reqIndex} className="flex items-start space-x-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                              <p className="text-sm text-green-700 dark:text-green-200">
                                {program.additionalInfo}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* Process Tab */}
            <TabsContent value="process" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Application Process</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Follow these simple steps to complete your application to UCAES. Our streamlined process makes it easy to apply.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  {applicationProcess.map((step, index) => (
                    <div key={step.step} className="flex items-start space-x-4 pb-8">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full text-white font-bold">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <step.icon className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{step.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {step.duration}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                      {index < applicationProcess.length - 1 && (
                        <div className="absolute left-6 mt-12 w-0.5 h-16 bg-border" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link href="/apply">
                      Start Your Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Important Dates Tab */}
            <TabsContent value="dates" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Important Dates</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Mark your calendar with these important admission dates for the 2024/2025 academic year.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="space-y-4">
                    {importantDates.map((item, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{item.event}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-primary">{item.date}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Academic Calendar Tab */}
            <TabsContent value="calendar" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Academic Calendar</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    The academic year at UCAES is structured as follows:
                  </p>
                </div>
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-3 text-green-800">Regular</h3>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                      <li>First semester (September to December)</li>
                      <li>Second semester (February to May)</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-3 text-blue-800">Weekend Semester</h3>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                      <li>First trimester (October to December)</li>
                      <li>Second trimester (February to May)</li>
                      <li>Third trimester (June to August)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Fees Tab */}
            <TabsContent value="fees" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Fees Structure</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Transparent and competitive fee structure designed to provide excellent value for quality education.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Application Fees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span>Application Fees</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Domestic Students</span>
                          <span className="font-semibold">{fees.application.domestic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>International Students</span>
                          <span className="font-semibold">{fees.application.international}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tuition Fees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <span>Annual Tuition Fees</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Undergraduate Programs</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>BSc Agriculture</span>
                              <span className="font-semibold">{fees.tuition.undergraduate.agriculture}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>BSc Environmental Science</span>
                              <span className="font-semibold">{fees.tuition.undergraduate.environmental}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>BSc Agribusiness</span>
                              <span className="font-semibold">{fees.tuition.undergraduate.agribusiness}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Postgraduate Programs</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Master's Programs</span>
                              <span className="font-semibold">{fees.tuition.postgraduate.masters}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>PhD Programs</span>
                              <span className="font-semibold">{fees.tuition.postgraduate.phd}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Accommodation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>Accommodation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Hostel (Shared)</span>
                          <span className="font-semibold">{fees.accommodation.hostel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Apartment (Private)</span>
                          <span className="font-semibold">{fees.accommodation.apartment}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Fees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Other Fees</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Registration Fee</span>
                          <span className="font-semibold">{fees.other.registration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Library Fee</span>
                          <span className="font-semibold">{fees.other.library}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sports Fee</span>
                          <span className="font-semibold">{fees.other.sports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medical Fee</span>
                          <span className="font-semibold">{fees.other.medical}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Scholarships Tab */}
            <TabsContent value="scholarships" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Scholarships & Financial Aid</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    We believe in making quality education accessible. Explore our scholarship opportunities and financial aid programs.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {scholarships.map((scholarship, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-primary" />
                          <span>{scholarship.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Award Amount:</span>
                            <div className="font-semibold text-primary">{scholarship.amount}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Criteria:</span>
                            <p className="text-sm">{scholarship.criteria}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Application Deadline:</span>
                            <div className="font-medium">{scholarship.deadline}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Need Financial Assistance?</h3>
                      <p className="text-muted-foreground mb-4">
                        Our financial aid office is here to help you explore all available options to fund your education.
                      </p>
                      <Button variant="outline">
                        Contact Financial Aid Office
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Find answers to common questions about the admission process, requirements, and campus life.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need More Information?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our admissions team is ready to help you with any questions about the application process or our programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground text-sm mb-2">Monday - Friday</p>
                <p className="text-muted-foreground text-sm mb-4">8:00 AM - 5:00 PM</p>
                <p className="font-medium">+233 (0) 123 456 789</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get detailed information about programs and requirements
                </p>
                <p className="font-medium">admissions@ucaes.edu.gh</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Schedule a campus tour and meet our admissions team
                </p>
                <p className="font-medium">Bunso, Eastern Region, Ghana</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}