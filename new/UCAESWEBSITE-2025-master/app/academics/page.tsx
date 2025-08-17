"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Clock,
  Globe,
  Microscope,
  Leaf,
  TrendingUp,
  Building,
  Calendar,
  FileText,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const schools = [
  {
    id: 'agriculture',
    name: 'Faculty of Agriculture and Rural Development',
    description: 'Comprehensive agricultural education focused on sustainable farming practices and rural development.',
    icon: Leaf,
    programs: [
      {
        name: 'Certificate in Sustainable Agriculture',
        level: 'Certificate',
        duration: '1 year',
        credits: '30 credits',
        description: 'Foundation program focused on sustainable and organic farming practices.',
        specializations: ['Organic Farming', 'Sustainable Practices', 'Farm Management'],
        careerPaths: ['Farm Assistant', 'Agricultural Extension Officer', 'Organic Farm Manager']
      },
      {
        name: 'Diploma in Organic Agriculture',
        level: 'Diploma',
        duration: '2 years',
        credits: '60 credits',
        description: 'Specialized diploma program in organic agricultural production and management.',
        specializations: ['Organic Crop Production', 'Pest Management', 'Soil Conservation', 'Farm Planning'],
        careerPaths: ['Organic Farm Supervisor', 'Agricultural Trainer', 'Rural Development Officer']
      },
      {
        name: 'BSc Sustainable Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        credits: '120 credits',
        description: 'Comprehensive program covering sustainable crop production, animal husbandry, and agricultural systems.',
        specializations: ['Sustainable Farming Systems', 'Agroforestry', 'Agricultural Economics', 'Rural Development'],
        careerPaths: ['Agricultural Officer', 'Farm Manager', 'Agricultural Consultant', 'Research Assistant']
      }
    ]
  },
  {
    id: 'environmental',
    name: 'Faculty of Environment and Conservation',
    description: 'Interdisciplinary approach to environmental challenges, conservation, and sustainable development.',
    icon: Globe,
    programs: [
      {
        name: 'Certificate in Environmental Science and Waste Management',
        level: 'Certificate',
        duration: '1 year',
        credits: '30 credits',
        description: 'Introduction to environmental principles and waste management techniques.',
        specializations: ['Waste Collection', 'Environmental Monitoring', 'Conservation Basics'],
        careerPaths: ['Environmental Assistant', 'Waste Management Technician', 'Conservation Assistant']
      },
      {
        name: 'BSc Environmental Science and Waste Management',
        level: 'Undergraduate',
        duration: '4 years',
        credits: '120 credits',
        description: 'Comprehensive program addressing environmental challenges and waste management solutions.',
        specializations: ['Environmental Management', 'Waste Treatment', 'Environmental Policy', 'Conservation'],
        careerPaths: ['Environmental Officer', 'Waste Management Specialist', 'Environmental Analyst', 'Conservation Officer']
      }
    ]
  }
];

const researchCenters = [
  {
    name: 'Ecoland Ghana Partnership',
    focus: 'Sustainable agriculture and environmental conservation',
    projects: ['Organic farming systems', 'Environmental education', 'Sustainable land management'],
    director: 'Mrs. Selina Acheampong',
    established: '2018'
  },
  {
    name: 'Environmental Research Unit',
    focus: 'Environmental conservation and ecosystem management',
    projects: ['Waste management solutions', 'Water quality monitoring', 'Conservation practices'],
    director: 'Mr. Benard Kusi-oppong',
    established: '2015'
  }
];

const facilities = [
  {
    name: 'Student Hostels',
    description: 'Comfortable accommodations for students located on campus.',
    features: ['Student Rooms', 'Common Areas', 'Basic Amenities']
  },
  {
    name: 'Cafeteria',
    description: 'Campus dining facility offering meals and refreshments to students and staff.',
    features: ['Dining Area', 'Food Service', 'Seating']
  },
  {
    name: 'Volley Court',
    description: 'Sports facility for students to engage in volleyball and recreational activities.',
    features: ['Volleyball Court', 'Recreational Area', 'Student Activities']
  },
  {
    name: 'Learning Resources',
    description: 'Educational resources to support student learning.',
    features: ['Study Areas', 'Learning Materials', 'Reference Materials']
  }
];

const academicCalendar = [
  {
    semester: 'Regular - First Semester',
    startDate: 'September 2024',
    endDate: 'December 2024',
    events: [
      { date: 'Sept 2-6', event: 'Registration & Orientation' },
      { date: 'Sept 9', event: 'Classes Begin' },
      { date: 'Oct 15-19', event: 'Mid-Semester Break' },
      { date: 'Dec 2-13', event: 'Final Examinations' },
      { date: 'Dec 20', event: 'Semester Ends' }
    ]
  },
  {
    semester: 'Regular - Second Semester',
    startDate: 'February 2025',
    endDate: 'May 2025',
    events: [
      { date: 'Feb 3-7', event: 'Registration' },
      { date: 'Feb 10', event: 'Classes Begin' },
      { date: 'Mar 24-28', event: 'Mid-Semester Break' },
      { date: 'May 12-23', event: 'Final Examinations' },
      { date: 'May 30', event: 'Semester Ends' }
    ]
  },
  {
    semester: 'Weekend - First Trimester',
    startDate: 'October 2024',
    endDate: 'December 2024',
    events: [
      { date: 'Oct 5-6', event: 'Registration & Orientation' },
      { date: 'Oct 12', event: 'Classes Begin' },
      { date: 'Nov 16-17', event: 'Mid-Trimester Assessment' },
      { date: 'Dec 14-15', event: 'Final Examinations' },
      { date: 'Dec 22', event: 'Trimester Ends' }
    ]
  },
  {
    semester: 'Weekend - Second Trimester',
    startDate: 'February 2025',
    endDate: 'May 2025',
    events: [
      { date: 'Feb 1-2', event: 'Registration' },
      { date: 'Feb 8', event: 'Classes Begin' },
      { date: 'Mar 22-23', event: 'Mid-Trimester Assessment' },
      { date: 'May 3-4', event: 'Final Examinations' },
      { date: 'May 11', event: 'Trimester Ends' }
    ]
  },
  {
    semester: 'Weekend - Third Trimester',
    startDate: 'June 2025',
    endDate: 'August 2025',
    events: [
      { date: 'June 7-8', event: 'Registration' },
      { date: 'June 14', event: 'Classes Begin' },
      { date: 'July 19-20', event: 'Mid-Trimester Assessment' },
      { date: 'Aug 16-17', event: 'Final Examinations' },
      { date: 'Aug 24', event: 'Trimester Ends' }
    ]
  }
];

export default function AcademicsPage() {
  const [selectedSchool, setSelectedSchool] = useState('agriculture');
  const [selectedProgram, setSelectedProgram] = useState(null);

  const currentSchool = schools.find(school => school.id === selectedSchool);

  return (
    <div className="pt-16">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <Badge className="mb-4 bg-green-700 text-white">Academic Excellence</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
              Academic Programs & Research
            </h1>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our comprehensive range of undergraduate and postgraduate programs designed to prepare you for leadership in agriculture, environmental science, and agribusiness.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-green-50 dark:bg-green-900/10 border-t border-b border-green-100 dark:border-green-800/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">15+</div>
                <div className="text-sm font-medium text-muted-foreground">Academic Programs</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">200+</div>
                <div className="text-sm font-medium text-muted-foreground">Faculty Members</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                  <Microscope className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">4</div>
                <div className="text-sm font-medium text-muted-foreground">Research Centers</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">95%</div>
                <div className="text-sm font-medium text-muted-foreground">Graduate Employment</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-700 text-white">Discover UCAES</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Academic Excellence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Our institution offers outstanding academic programs, cutting-edge research facilities, and a rich learning environment to prepare you for success.
            </p>
          </div>
          
          <Tabs defaultValue="programs" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 p-1 bg-green-100 dark:bg-green-900/20 rounded-lg mb-6">
              <TabsTrigger value="programs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm py-3">
                <BookOpen className="h-4 w-4 mr-2" />
                Programs
              </TabsTrigger>
              <TabsTrigger value="research" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm py-3">
                <Microscope className="h-4 w-4 mr-2" />
                Research
              </TabsTrigger>
              <TabsTrigger value="facilities" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm py-3">
                <Building className="h-4 w-4 mr-2" />
                Facilities
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm py-3">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>

            {/* Programs Tab */}
            <TabsContent value="programs" className="mt-8">
              <div className="space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Academic Faculties & Programs</h2>
                  <p className="text-lg text-muted-foreground">
                    Choose from our diverse range of programs across specialized faculties, each designed to meet industry demands and prepare you for successful careers in sustainable agriculture and environmental management.
                  </p>
                </div>

                {/* School Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {schools.map((school) => (
                    <Card
                      key={school.id}
                      className={`cursor-pointer transition-all duration-300 border-0 hover:transform hover:scale-[1.01] ${
                        selectedSchool === school.id
                          ? 'ring-2 ring-green-600 bg-green-50 dark:bg-green-900/20 shadow-lg'
                          : 'hover:shadow-xl bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => setSelectedSchool(school.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-full ${
                            school.id === 'agriculture' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <school.icon className={`h-8 w-8 ${
                              school.id === 'agriculture' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{school.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{school.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected School Details */}
                {currentSchool && (
                  <div className="space-y-8">
                    <div className={`p-6 rounded-lg ${
                      currentSchool.id === 'agriculture' ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-green-600' : 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          currentSchool.id === 'agriculture' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <currentSchool.icon className={`h-8 w-8 ${
                            currentSchool.id === 'agriculture' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-bold text-xl ${
                            currentSchool.id === 'agriculture' ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
                          }`}>{currentSchool.name}</h3>
                          <p className="text-muted-foreground mt-1">{currentSchool.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Programs Section Heading */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Available Programs</h3>
                      <div className="w-20 h-1 bg-green-600 mx-auto mb-8"></div>
                    </div>

                    {/* Programs Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {currentSchool.programs.map((program, index) => (
                        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                          <div className={`h-2 w-full ${
                            program.level === 'Undergraduate' ? 'bg-green-600' : 
                            program.level === 'Diploma' ? 'bg-blue-600' : 'bg-amber-500'
                          }`}></div>
                          <CardHeader className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`${
                                program.level === 'Undergraduate' ? 'bg-green-600 hover:bg-green-700' : 
                                program.level === 'Diploma' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
                              } text-white`}>
                                {program.level}
                              </Badge>
                              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">{program.duration}</span>
                              </div>
                            </div>
                            <CardTitle className="text-xl">{program.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <p className="text-muted-foreground">{program.description}</p>
                            
                            <div>
                              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Specializations</h4>
                              <div className="flex flex-wrap gap-2">
                                {program.specializations.map((spec, specIndex) => (
                                  <Badge key={specIndex} variant="outline" className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-sm">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Career Paths</h4>
                              <ul className="space-y-2">
                                {program.careerPaths.slice(0, 3).map((career, careerIndex) => (
                                  <li key={careerIndex} className="flex items-center space-x-2">
                                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm">{career}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                              <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{program.credits}</span>
                              <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Learn More
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research" className="mt-8">
              <div className="space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Research Centers & Innovation</h2>
                  <p className="text-lg text-muted-foreground">
                    Our research centers drive innovation in agriculture and environmental science, addressing critical challenges facing Ghana and Africa.
                  </p>
                </div>

                {/* Research Overview */}
                <div className="relative">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-green-50 dark:bg-green-900/10 -z-10 rounded-l-3xl hidden lg:block"></div>
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <Badge className="bg-green-700 text-white">Our Research Focus</Badge>
                        <h3 className="text-2xl font-bold">Advancing Sustainable Solutions</h3>
                        <p className="text-muted-foreground">
                          UCAES is committed to pioneering research that addresses critical agricultural and environmental challenges. Our interdisciplinary approach brings together experts from various fields to develop practical solutions that benefit communities and ecosystems.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="flex items-start gap-2">
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mt-1">
                              <Leaf className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Sustainable Agriculture</h4>
                              <p className="text-sm text-muted-foreground">Exploring climate-smart farming techniques</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mt-1">
                              <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Environmental Conservation</h4>
                              <p className="text-sm text-muted-foreground">Developing solutions for ecosystem preservation</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="lg:pl-12">
                        <Card className="overflow-hidden shadow-xl">
                          <div className="aspect-video relative bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center p-8 text-center">
                            <Microscope className="absolute h-40 w-40 text-green-500/10" />
                            <div className="relative z-10 text-white">
                              <h3 className="text-xl font-bold mb-2">Research Impact</h3>
                              <div className="grid grid-cols-2 gap-6 mt-6">
                                <div>
                                  <div className="text-3xl font-bold">500+</div>
                                  <div className="text-sm text-green-100">Published Papers</div>
                                </div>
                                <div>
                                  <div className="text-3xl font-bold">50+</div>
                                  <div className="text-sm text-green-100">Active Projects</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Research Centers */}
                <div>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">Research Centers</h3>
                    <div className="w-20 h-1 bg-green-600 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {researchCenters.map((center, index) => (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-green-600 to-blue-600"></div>
                        <CardHeader className="bg-green-50/50 dark:bg-green-900/10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-green-800 dark:text-green-200">{center.name}</CardTitle>
                            <Badge className="bg-green-600 text-white">Est. {center.established}</Badge>
                        </div>
                      </CardHeader>
                        <CardContent className="p-6 space-y-5">
                        <p className="text-muted-foreground">{center.focus}</p>
                        
                        <div>
                            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Current Projects</h4>
                            <ul className="space-y-2 pl-2">
                            {center.projects.map((project, projectIndex) => (
                                <li key={projectIndex} className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Star className="h-3 w-3 text-amber-500" />
                                  </div>
                                  <span className="text-muted-foreground">{project}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <span className="text-xs uppercase tracking-wider text-gray-500">Director</span>
                              <div className="font-medium text-green-700 dark:text-green-300">{center.director}</div>
                            </div>
                            <Button variant="outline" className="border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20">
                              View Projects
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>

                {/* Research CTA */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-700 to-green-600 p-8 text-white">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                      <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold mb-4">Research Opportunities</h3>
                        <p className="text-green-50 mb-6">
                          Join our research community and contribute to solving real-world challenges in agriculture and environmental science. We welcome collaborations with researchers, industry partners, and students passionate about sustainable solutions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50 border-0">
                        Research Publications
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                          <Button variant="outline" className="border-white text-white hover:bg-green-600">
                        Collaborate With Us
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                        </div>
                      </div>
                      <div className="hidden lg:block">
                        <div className="relative w-40 h-40 mx-auto">
                          <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full bg-white/20"></div>
                          <div className="absolute inset-4 rounded-full bg-white/30 flex items-center justify-center">
                            <Microscope className="h-16 w-16 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Facilities Tab */}
            <TabsContent value="facilities" className="mt-8">
              <div className="space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Campus Facilities</h2>
                  <p className="text-lg text-muted-foreground">
                    Our well-maintained campus facilities provide students with comfortable living spaces and excellent learning environments to enhance their educational experience.
                  </p>
                </div>

                {/* Facility Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-3">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-0 overflow-hidden shadow-lg">
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                              <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Modern Campus</h3>
                            <p className="text-sm text-muted-foreground">Designed for comfort and productivity</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Student Spaces</h3>
                            <p className="text-sm text-muted-foreground">Areas for collaboration and relaxation</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                              <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Learning Resources</h3>
                            <p className="text-sm text-muted-foreground">Access to educational materials</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                              <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Green Spaces</h3>
                            <p className="text-sm text-muted-foreground">Natural areas for studying and reflection</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Facilities Grid */}
                <div>
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold mb-2">Campus Amenities</h3>
                    <div className="w-20 h-1 bg-green-600 mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {facilities.map((facility, index) => (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="h-48 bg-green-100 dark:bg-green-900/20 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-24 h-24 rounded-full ${
                              index === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 
                              index === 1 ? 'bg-amber-100 dark:bg-amber-900/30' :
                              index === 2 ? 'bg-green-100 dark:bg-green-900/30' :
                              'bg-purple-100 dark:bg-purple-900/30'
                            } flex items-center justify-center`}>
                              <Building className={`h-12 w-12 ${
                                index === 0 ? 'text-blue-600 dark:text-blue-400' : 
                                index === 1 ? 'text-amber-600 dark:text-amber-400' :
                                index === 2 ? 'text-green-600 dark:text-green-400' :
                                'text-purple-600 dark:text-purple-400'
                              }`} />
                            </div>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{facility.name}</CardTitle>
                      </CardHeader>
                        <CardContent className="space-y-5">
                        <p className="text-muted-foreground">{facility.description}</p>
                        
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3">Key Features</h4>
                            <div className="grid grid-cols-1 gap-3">
                            {facility.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                  </div>
                                  <span className="text-sm font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>

                {/* Tour CTA */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl overflow-hidden shadow-xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 lg:p-12">
                      <Badge className="bg-white text-green-700 mb-4">Visit Our Campus</Badge>
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Experience UCAES Firsthand
                      </h3>
                      <p className="text-green-50 mb-8 text-lg">
                        Schedule a campus tour to see our facilities, meet with faculty, and get a feel for student life at UCAES.
                      </p>
                      <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50">
                    <Link href="/contact">
                      Schedule a Campus Tour
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                    </div>
                    <div className="hidden lg:flex items-center justify-center p-12">
                      <div className="relative w-64 h-64">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/30 animate-spin-slow"></div>
                        <div className="absolute inset-8 rounded-full border-4 border-dashed border-white/50 animate-spin-slow-reverse"></div>
                        <div className="absolute inset-16 rounded-full bg-white/10 flex items-center justify-center">
                          <Building className="h-16 w-16 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="mt-8">
              <div className="space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Academic Calendar 2024/2025</h2>
                  <p className="text-lg text-muted-foreground">
                    Plan your academic year with our comprehensive calendar of important dates and events for both regular and weekend programs.
                  </p>
                </div>

                {/* Calendar Overview */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-8 rounded-xl shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 space-y-4">
                      <Badge className="bg-green-700 text-white">Important Dates</Badge>
                      <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Plan Your Academic Year</h3>
                      <p className="text-muted-foreground">
                        UCAES operates on both a semester system for regular programs and a trimester system for weekend programs. Below you'll find all key dates for registration, classes, examinations, and breaks.
                      </p>
                      <div className="flex items-center gap-8 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-green-600"></div>
                          <span className="text-sm font-medium">Regular Program</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                          <span className="text-sm font-medium">Weekend Program</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="relative w-40 h-40 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-green-600" />
                        </div>
                        <div className="absolute top-0 right-0 h-12 w-12 rounded-full bg-amber-500 border-4 border-white flex items-center justify-center text-white font-bold">
                          24
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regular Program Calendar */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-green-600"></div>
                    <span>Regular Program - Semester Calendar</span>
                  </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {academicCalendar.slice(0, 2).map((semester, index) => (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-green-600 w-full"></div>
                        <CardHeader className="bg-green-50/50 dark:bg-green-900/10 pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <Calendar className="h-6 w-6 text-green-600" />
                          <span>{semester.semester}</span>
                        </CardTitle>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          {semester.startDate} - {semester.endDate}
                            </Badge>
                          </div>
                      </CardHeader>
                        <CardContent className="p-6">
                        <div className="space-y-3">
                          {semester.events.map((event, eventIndex) => (
                              <div 
                                key={eventIndex} 
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  event.event.includes('Break') ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' : 
                                  event.event.includes('Exam') ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 
                                  event.event.includes('Begin') ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : 
                                  'bg-gray-50 dark:bg-gray-800/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center font-bold text-lg">
                                    {event.date.split(' ')[1]?.substring(0, 2) || event.date.substring(0, 2)}
                                  </div>
                              <span className="text-sm font-medium">{event.date}</span>
                                </div>
                                <span className="text-sm font-medium">{event.event}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </div>

                {/* Weekend Program Calendar */}
                      <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-600"></div>
                    <span>Weekend Program - Trimester Calendar</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {academicCalendar.slice(2, 5).map((semester, index) => (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-blue-600 w-full"></div>
                        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 pb-4">
                          <div className="flex flex-col">
                            <CardTitle className="flex items-center gap-3 text-lg mb-2">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <span>{semester.semester}</span>
                            </CardTitle>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 w-fit">
                              {semester.startDate} - {semester.endDate}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            {semester.events.map((event, eventIndex) => (
                              <div 
                                key={eventIndex} 
                                className={`p-3 rounded-lg ${
                                  event.event.includes('Break') || event.event.includes('Assessment') ? 'bg-amber-50 dark:bg-amber-900/20' : 
                                  event.event.includes('Exam') ? 'bg-blue-50 dark:bg-blue-900/20' : 
                                  event.event.includes('Begin') ? 'bg-green-50 dark:bg-green-900/20' : 
                                  'bg-gray-50 dark:bg-gray-800/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{event.date}</span>
                                  <div className={`w-2 h-2 rounded-full ${
                                    event.event.includes('Break') || event.event.includes('Assessment') ? 'bg-amber-500' : 
                                    event.event.includes('Exam') ? 'bg-blue-500' : 
                                    event.event.includes('Begin') ? 'bg-green-500' : 
                                    'bg-gray-500'
                                  }`}></div>
                                </div>
                                <span className="text-sm font-medium">{event.event}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Download Section */}
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    <div className="lg:col-span-1 bg-green-700 p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                          <FileText className="h-10 w-10 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-1">Academic Calendar</h4>
                        <p className="text-green-100">Complete Version</p>
                      </div>
                    </div>
                    <div className="lg:col-span-2 p-8">
                      <h3 className="text-xl font-bold mb-3">Download Full Academic Calendar</h3>
                      <p className="text-muted-foreground mb-6">
                        Access the complete academic calendar with all important dates, deadlines, and additional information about university events and activities for the 2024/2025 academic year.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <FileText className="mr-2 h-4 w-4" />
                          Download PDF Calendar
                        </Button>
                      <Button variant="outline">
                          Add to My Calendar
                          <Calendar className="ml-2 h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/bunner/503376212_207124822414945_2884212800618643824_n.jpg" 
            alt="UCAES Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/85 to-green-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-8">
              <div>
                <Badge className="bg-white text-green-800 mb-4">Admissions Open</Badge>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Academic Journey?
            </h2>
                <p className="text-xl text-white/90">
              Explore our programs, connect with faculty, and discover how UCAES can help you achieve your career goals in agriculture and environmental science.
            </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Expert Faculty</h3>
                    <p className="text-white/80">Learn from industry professionals and experienced educators</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Hands-on Experience</h3>
                    <p className="text-white/80">Practical learning through field work and research projects</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-white text-green-800 hover:bg-green-50">
                <Link href="/admissions">
                  Apply for Admission
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">
                  Contact Academic Office
                </Link>
              </Button>
              </div>
            </div>
            
            {/* Application Card */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    Application Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-lg">1</div>
                      <div>
                        <h4 className="font-medium">Submit Application</h4>
                        <p className="text-sm text-muted-foreground">Complete the online application form</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-lg">2</div>
                      <div>
                        <h4 className="font-medium">Document Verification</h4>
                        <p className="text-sm text-muted-foreground">Submit required academic documents</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-lg">3</div>
                      <div>
                        <h4 className="font-medium">Admission Decision</h4>
                        <p className="text-sm text-muted-foreground">Receive your acceptance letter</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Start Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}