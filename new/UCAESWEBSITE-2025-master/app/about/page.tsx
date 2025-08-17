"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  Eye, 
  Award,
  BookOpen,
  Globe,
  Download,
  ExternalLink
} from 'lucide-react';

const leadership = [
  {
    name: "Okyenhene Amoatia Ofori Panin II",
    position: "Chancellor",
    image: "/images/photos/The Chancellor.jpg",
    bio: "As the King of Akyem Abuakwa, Okyenhene Amoatia Ofori Panin II serves as Chancellor of UCAES. He initiated the creation of the university to promote sustainable agricultural practices and environmental stewardship in Ghana.",
    qualifications: "King of Akyem Abuakwa, Founder of UCAES"
  },
  {
    name: "Dr. Emmanuel Kofi Asante",
    position: "Rector",
    image: "/images/photos/Prof. Patrick Ofori-Danson.jpg",
    bio: "Dr. Asante is a renowned expert in environmental science with particular focus on climate change adaptation in agriculture. He has led numerous international research collaborations.",
    qualifications: "PhD Environmental Science, MSc Ecology"
  },
  {
    name: "Mrs. Selina Acheampong",
    position: "Acting Dean of Agriculture",
    useInitials: true,
    bio: "Mrs. Acheampong leads the Faculty of Agriculture and Rural Development with expertise in sustainable agricultural practices. She oversees curriculum development and research initiatives.",
    qualifications: "MSc Agricultural Science, BSc Agriculture"
  },
  {
    name: "Mr. Benard Kusi-oppong",
    position: "Acting Dean of Environment",
    image: "/images/photos/Dr.Benard Kusi.jpg",
    bio: "Mr. Kusi-oppong heads the Faculty of Environment and Conservation, focusing on environmental science and waste management programs. He has led several initiatives to promote sustainable environmental practices.",
    qualifications: "MSc Environmental Management, BSc Environmental Science"
  }
];

const milestones = [
  { year: "2006", event: "University College established by the Akyem Abuakwa Traditional Council" },
  { year: "2006", event: "Registered under Ghana's Companies Code, 1963 (Act 179) in October" },
  { year: "2011", event: "Received accreditation from Ghana Tertiary Education Commission" },
  { year: "2015", event: "Expanded program offerings with Environmental Science and Waste Management" },
  { year: "2018", event: "Established partnership with Ecoland Ghana" },
  { year: "2020", event: "Introduced Certificate programs in Sustainable Agriculture" },
  { year: "2022", event: "Expanded Faculty of Environment and Conservation" },
  { year: "2023", event: "Celebrating our commitment to excellence in agricultural education" }
];

export default function AboutPage() {
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative">
        {/* Banner Image */}
        <div className="relative h-[400px] w-full">
          <img
            src="/images/bunner/aboutus bunner.jpg"
            alt="About UCAES Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto animate-fade-in text-white">
              <Badge variant="secondary" className="mb-4 bg-green-700 text-white">About UCAES</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
              20 Years of Excellence in Agricultural Education
            </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                The University College of Agriculture and Environmental Studies is Africa's first university solely focused on agriculture and environmental studies.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brief History Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-700 text-white">Our Story</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Brief History of UCAES</h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="lead text-lg text-muted-foreground leading-relaxed mb-6">
                The University College of Agriculture and Environmental Studies (UCAES) is Africa's first university solely focused on agriculture and environmental studies. It was established by the Akyem Abuakwa Traditional Council under the visionary leadership of His Majesty, Osagyefuo Amoatia Ofori Panin, the Okyenhene.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Registered in October 2006 under Ghana's Companies Code, 1963 (Act 179), UCAES stands as a significant private-sector initiative designed to bridge the gap in tertiary education for qualified students unable to access public universities due to limited capacity.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Rooted in the cultural heritage of the Akyem people, who have traditionally practiced subsistence farming, especially among women. UCAES seeks to integrate innovation, research, and technology to modernize agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Philosophy Section */}
      <section className="py-20 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-700 text-white">Our Approach</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Educational Philosophy</h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="lead text-lg text-muted-foreground leading-relaxed mb-8">
                The University College of Agriculture and Environmental Studies (UCAES) has been established to offer tertiary-level education in disciplines that bear close pedagogical relationship to each other and to the general and ultimate welfare of the environment, i.e. safeguarding the Earth's Ecosystem. By this commission, UCAES enters the national tertiary education scene as the institution uniquely dedicated to finding answers to environmental challenges and providing sustainable options to the national agricultural development framework.
              </p>
              
              <p className="text-muted-foreground font-semibold mb-6 text-lg">
                The philosophy of the University College is entirely unique:
              </p>
              
              <div className="space-y-8 mt-8">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">1</div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold">First</span>, programmes offered are designed to educate the student to recognize and understand fundamental natural systems and processes and the scientific, technological and human development dimensions of the environment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">2</div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold">Secondly</span>, the style of teaching and instruction is distinctively investigative in nature by actively involving the student in the development of effective solutions that lead to a reversal of the inordinate and uncontrollable exploitation of nature and promotion of agricultural development.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">3</div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold">Thirdly</span>, the educational philosophy is purposely and deliberately conceived to endow the student with entrepreneurial skills so as to identify and pursue opportunities in environment and agriculture. Emerging from the rising global concern for the Environment.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">4</div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold">Finally</span>, a certificate programme in information technology for the exclusive benefit of the regular student pursuing a degree programme will run alongside.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-700 text-white">Our Core Principles</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Guiding Philosophy</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Our institution is built on strong foundational principles that guide our approach to education, research, and community engagement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-green-600 animate-fade-in">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <Target className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
                <p className="text-base leading-relaxed">
                  The mission of the university college in the next five years is to become an institution that provides high quality tertiary education in agriculture and the environment and through which developmental programmes in Ghana can be achieved with strong emphasis on high moral and ethical values among the youth.
                </p>
                <p className="text-base leading-relaxed mt-4">
                  It will also help raise the standard of education and development at Bunso and its environs through outreach programmes which are demand-driven.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-blue-600 animate-fade-in">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                  <Eye className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
                <p className="text-base leading-relaxed">
                  The vision of UCAES is to be a leading institution in the teaching, researching, and practice of sustainable agriculture and environmental sustainability.
                </p>
                <p className="text-base leading-relaxed mt-4">
                  UCAES aims to create a strong scientific and technological knowledge base to address national, regional, and global environmental challenges. It strives to be a catalytic institution, producing graduates equipped with the knowledge and skills to be agents of change in environmental sustainability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-amber-500 animate-fade-in">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                  <Award className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Our Values</h3>
                <ul className="space-y-4 text-left">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span><strong>Excellence</strong> in everything we do</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span><strong>Integrity</strong> in our actions and decisions</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span><strong>Innovation</strong> in our approach to challenges</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span><strong>Sustainability</strong> in all our practices</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span><strong>Community Service</strong> as our priority</span>
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  These values guide everything we do as we cultivate the next generation of agricultural leaders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* History & Milestones */}
      <section className="py-20 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-green-700 text-white">Our Journey</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              A Legacy of Growth and Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From our humble beginnings to becoming a leading agricultural institution, explore the key milestones that have shaped UCAES.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-600 rounded-full" />
            
            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'} animate-slide-up`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'} relative`}>
                    {/* Connector line to timeline */}
                    <div className={`absolute top-1/2 ${index % 2 === 0 ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} w-12 h-1 bg-green-600`}></div>
                    
                    {/* Timeline dot */}
                    <div className={`absolute top-1/2 transform -translate-y-1/2 ${index % 2 === 0 ? 'right-0 translate-x-12' : 'left-0 -translate-x-12'} w-6 h-6 rounded-full border-4 border-green-600 bg-white z-10`}></div>
                    
                    <Card className="hover:shadow-xl transition-all duration-300 border border-green-100 dark:border-green-900/30 bg-white dark:bg-gray-800/90">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {milestone.year}
                          </div>
                          <div>
                            <p className="text-lg font-medium">{milestone.event}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-6 px-4 py-1.5 text-base bg-green-700 text-white">Leadership</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Meet Our Academic Leaders
            </h2>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our experienced leadership team brings decades of expertise in agriculture, education, and research to guide UCAES forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in border-t-4 border-green-600"
                onClick={() => setSelectedLeader(selectedLeader === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    {leader.useInitials ? (
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-green-600 flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500">
                        <span className="text-white text-4xl font-bold">
                          {leader.name.split(' ').map(word => word[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-green-600">
                    <img
                      src={leader.image}
                      alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                    <p className="text-green-600 dark:text-green-400 font-medium text-sm mb-2">{leader.position}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-3">
                    <p className="text-sm text-muted-foreground">{leader.qualifications}</p>
                  </div>
                  
                  {selectedLeader === index && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg animate-fade-in border-l-2 border-green-600">
                      <p className="text-sm text-muted-foreground">{leader.bio}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 ${selectedLeader === index ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                    >
                    {selectedLeader === index ? 'Hide Bio' : 'View Bio'}
                  </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Organizational Structure & Documents */}
      <section className="py-20 bg-blue-50 dark:bg-blue-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-green-700 text-white">Governance & Policies</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Transparency & Accountability
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access our organizational structure, policies, and key documents that guide our operations.
            </p>
          </div>

          <Tabs defaultValue="structure" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TabsTrigger value="structure" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm">
                Organizational Structure
              </TabsTrigger>
              <TabsTrigger value="policies" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm">
                Policies & Reports
              </TabsTrigger>
              <TabsTrigger value="partnerships" className="data-[state=active]:bg-white dark:data-[state=active]:bg-green-800 data-[state=active]:text-green-700 dark:data-[state=active]:text-white rounded-md data-[state=active]:shadow-sm">
                Partnerships
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="structure" className="mt-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">UCAES Organizational Chart</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Our governance structure ensures effective leadership and decision-making across all academic and administrative functions.
                    </p>
                  </div>
                  
                  <div className="space-y-8 max-w-4xl mx-auto">
                    {/* Board of Directors */}
                    <div className="text-center">
                      <div className="inline-block p-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg">
                        <h4 className="font-bold text-lg">Board of Directors</h4>
                      </div>
                    </div>
                    
                    {/* Arrow down */}
                    <div className="flex justify-center">
                      <div className="w-1 h-8 bg-green-600"></div>
                    </div>
                    
                    {/* Chancellor */}
                    <div className="text-center">
                      <div className="inline-block p-5 bg-gradient-to-r from-green-700 to-green-800 text-white rounded-lg shadow-lg">
                        <h4 className="font-bold text-lg">Chancellor</h4>
                        <p className="text-sm text-green-100">Okyenhene Amoatia Ofori Panin II</p>
                      </div>
                    </div>
                    
                    {/* Arrow down */}
                    <div className="flex justify-center">
                      <div className="w-1 h-8 bg-green-600"></div>
                    </div>
                    
                    {/* Rector */}
                    <div className="text-center">
                      <div className="inline-block p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg w-64">
                        <h4 className="font-bold text-lg">Rector</h4>
                        <p className="text-sm text-blue-100">Dr. Emmanuel Kofi Asante</p>
                      </div>
                    </div>
                    
                    {/* Arrow down */}
                    <div className="flex justify-center">
                      <div className="w-1 h-8 bg-green-600"></div>
                    </div>
                    
                    {/* Three divisions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="p-4 bg-green-100 border-t-4 border-green-600 rounded-lg shadow-md h-full">
                          <h4 className="font-bold mb-2">Academic Council</h4>
                          <p className="text-sm text-muted-foreground">Oversees curriculum development and academic standards</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="p-4 bg-amber-100 border-t-4 border-amber-600 rounded-lg shadow-md h-full">
                          <h4 className="font-bold mb-2">Administrative Board</h4>
                          <p className="text-sm text-muted-foreground">Manages financial, HR, and operational matters</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="p-4 bg-blue-100 border-t-4 border-blue-600 rounded-lg shadow-md h-full">
                          <h4 className="font-bold mb-2">Research Committee</h4>
                          <p className="text-sm text-muted-foreground">Coordinates research initiatives and partnerships</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow down */}
                    <div className="flex justify-center">
                      <div className="grid grid-cols-2 gap-x-32 w-full max-w-2xl">
                        <div className="flex flex-col items-center">
                          <div className="w-1 h-8 bg-green-600"></div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-1 h-8 bg-green-600"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Faculties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                      <div className="text-center">
                        <div className="p-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg h-full">
                          <h4 className="font-bold text-lg mb-2">Faculty of Agriculture</h4>
                          <p className="text-sm text-green-100">Agricultural Sciences, Agribusiness, Crop Science</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg h-full">
                          <h4 className="font-bold text-lg mb-2">Faculty of Environment</h4>
                          <p className="text-sm text-blue-100">Environmental Science, Conservation, Waste Management</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="policies" className="mt-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Policies & Reports</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Access key documents and reports that outline our policies, performance, and governance practices.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Button variant="outline" className="flex items-center justify-start p-6 h-auto bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-xl shadow-sm">
                      <Download className="mr-3 h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <div className="font-bold text-base">Student Handbook</div>
                        <div className="text-xs text-muted-foreground">PDF - 2.5MB</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center justify-start p-6 h-auto bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-xl shadow-sm">
                      <Download className="mr-3 h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <div className="font-bold text-base">Staff Code of Conduct</div>
                        <div className="text-xs text-muted-foreground">PDF - 1.8MB</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center justify-start p-6 h-auto bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-xl shadow-sm">
                      <Download className="mr-3 h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <div className="font-bold text-base">Academic Policy</div>
                        <div className="text-xs text-muted-foreground">PDF - 3.2MB</div>
                          </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center justify-start p-6 h-auto bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-xl shadow-sm">
                      <Download className="mr-3 h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <div className="font-bold text-base">Annual Report 2023</div>
                        <div className="text-xs text-muted-foreground">PDF - 5.6MB</div>
                          </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center justify-start p-6 h-auto bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-xl shadow-sm">
                      <Download className="mr-3 h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <div className="font-bold text-base">Financial Statement</div>
                        <div className="text-xs text-muted-foreground">PDF - 2.1MB</div>
                        </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center justify-start p-6 h-auto bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-xl shadow-sm">
                      <Download className="mr-3 h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <div className="font-bold text-base">Strategic Plan 2023-2028</div>
                        <div className="text-xs text-muted-foreground">PDF - 4.3MB</div>
                      </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
            </TabsContent>
            
            <TabsContent value="partnerships" className="mt-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-4">Our Partners</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      UCAES collaborates with various institutions, organizations, and industry partners to enhance our educational and research capabilities.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border-l-4 border-green-600 rounded-lg p-6 shadow-md">
                      <h4 className="font-bold text-lg mb-4 text-green-700">Academic Partnerships</h4>
                      <ul className="space-y-3">
                        {['University of Ghana', 'Kwame Nkrumah University of Science and Technology', 'University of Cape Coast', 'University of Development Studies', 'African Virtual University'].map((partner, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            <span className="text-muted-foreground">{partner}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white border-l-4 border-blue-600 rounded-lg p-6 shadow-md">
                      <h4 className="font-bold text-lg mb-4 text-blue-700">Industry Partners</h4>
                      <ul className="space-y-3">
                        {['Ecoland Ghana', 'Ghana Cocoa Board', 'Ministry of Food and Agriculture', 'Environmental Protection Agency', 'Ghana Agricultural Association'].map((partner, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-muted-foreground">{partner}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white border-l-4 border-amber-500 rounded-lg p-6 shadow-md">
                      <h4 className="font-bold text-lg mb-4 text-amber-700">International Collaborations</h4>
                      <ul className="space-y-3">
                        {['Food and Agriculture Organization (FAO)', 'United Nations Environment Programme (UNEP)', 'African Union Agriculture Commission', 'Cornell University (USA)', 'University of Reading (UK)'].map((partner, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-muted-foreground">{partner}</span>
                          </li>
                        ))}
                      </ul>
                          </div>
                    
                    <div className="bg-white border-l-4 border-purple-600 rounded-lg p-6 shadow-md">
                      <h4 className="font-bold text-lg mb-4 text-purple-700">Research Partnerships</h4>
                      <ul className="space-y-3">
                        {['Council for Scientific and Industrial Research (CSIR)', 'Crops Research Institute', 'Water Research Institute', 'Forestry Research Institute of Ghana', 'Soil Research Institute'].map((partner, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                            <span className="text-muted-foreground">{partner}</span>
                          </li>
                        ))}
                      </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}