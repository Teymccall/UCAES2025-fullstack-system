"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Building,
  GraduationCap,
  ChevronRight,
  Info
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const [showWatermark, setShowWatermark] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    
    // Simulate form submission
    setFormStatus({
      submitted: true,
      error: false,
      message: 'Thank you for your message. We will get back to you soon!'
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="pt-16">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in relative">
            <Badge className="mb-4 bg-green-700 text-white">Get In Touch</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
              Contact Us
            </h1>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about admissions, programs, or campus life? We're here to help you connect with the right people at UCAES.
            </p>
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
                This is my watermark.<br />Developed by Hanamel Achumboro Awenatey.<br />Contact: 0201778656
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white dark:bg-gray-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Address */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Our Location</h3>
                <p className="text-muted-foreground">
                  University College of Agriculture and Environmental Studies<br />
                  P.O. Box 27, Bunso<br />
                  Eastern Region, Ghana
                </p>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-2">
                  General Inquiries:<br />
                  <a href="mailto:info@ucaes.edu.gh" className="text-blue-600 hover:underline">info@ucaes.edu.gh</a>
                </p>
                <p className="text-muted-foreground">
                  Admissions:<br />
                  <a href="mailto:admissions@ucaes.edu.gh" className="text-blue-600 hover:underline">admissions@ucaes.edu.gh</a>
                </p>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                  <Phone className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Call Us</h3>
                <p className="text-muted-foreground mb-2">
                  Main Office:<br />
                  <a href="tel:+233541247178" className="text-amber-600 hover:underline">+233 (0) 54 124 7178</a>
                </p>
                <p className="text-muted-foreground">
                  Admissions:<br />
                  <a href="tel:+233500342659" className="text-amber-600 hover:underline">+233 (0) 50 034 2659</a>
                </p>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Office Hours</h3>
                <p className="text-muted-foreground mb-2">
                  Monday - Friday:<br />
                  8:00 AM - 5:00 PM
                </p>
                <p className="text-muted-foreground">
                  Saturday:<br />
                  9:00 AM - 1:00 PM
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50 dark:from-background dark:to-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-700 text-white">Reach Out</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Get In Touch With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're here to answer your questions and provide assistance. Feel free to reach out using the form below or visit our campus.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-green-700 p-4 text-white">
                  <h3 className="text-xl font-bold">Send Us a Message</h3>
                  <p className="text-sm text-white/80">
                    Fill out the form below and our team will get back to you as soon as possible.
                  </p>
                </div>
                <CardContent className="p-6">
                  {formStatus.submitted ? (
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <Send className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">{formStatus.message}</p>
                      <Button 
                        onClick={() => setFormStatus(prev => ({ ...prev, submitted: false }))}
                        className="bg-green-700 hover:bg-green-800"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your email address"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your phone number"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Message subject"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Your message"
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Map and Additional Info */}
            <div className="animate-fade-in">
              {/* Map Embed */}
              <Card className="border-0 shadow-xl overflow-hidden mb-8">
                <div className="bg-green-700 p-4 text-white">
                  <h3 className="text-xl font-bold">Our Location</h3>
                  <p className="text-sm text-white/80">
                    Visit our campus in Bunso, Eastern Region of Ghana
                  </p>
                </div>
                <CardContent className="p-0">
                  <div className="h-[300px]">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.3851169597936!2d-0.4659871!3d5.4915356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9d3c2f7c4f85%3A0x6c8f2e2f1b9e0c2a!2sUniversity%20College%20of%20Agriculture%20and%20Environmental%20Studies!5e0!3m2!1sen!2sgh!4v1718483881254!5m2!1sen!2sgh" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              {/* Department Contacts */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-green-700 p-4 text-white">
                  <h3 className="text-xl font-bold flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Department Contacts
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 border-l-4 border-green-600 bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-green-700" />
                        Faculty of Agriculture and Rural Development
                      </h4>
                      <p className="text-sm text-muted-foreground ml-6">
                        Email: agriculture@ucaes.edu.gh<br />
                        Phone: +233 (0) 24 580 9402
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-green-600 bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-green-700" />
                        Faculty of Environment and Conservation
                      </h4>
                      <p className="text-sm text-muted-foreground ml-6">
                        Email: environment@ucaes.edu.gh<br />
                        Phone: +233 (0) 24 622 3760
                      </p>
                    </div>
                    <div className="p-3 border-l-4 border-green-600 bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-green-700" />
                        Admissions Office
                      </h4>
                      <p className="text-sm text-muted-foreground ml-6">
                        Email: admissions@ucaes.edu.gh<br />
                        Phone: +233 (0) 50 034 2659<br />
                        WhatsApp: +233 (0) 54 124 7178
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-green-50 dark:bg-green-900/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-700 text-white">Help Center</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our university, programs, and admissions process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2 text-green-800 dark:text-green-400 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                    <span className="text-green-700 dark:text-green-400 font-bold">Q</span>
                  </div>
                  How do I apply for admission?
                </h3>
                <p className="text-muted-foreground mb-4 ml-10">
                  You can apply online through our admissions portal or visit our campus to pick up an application form.
                </p>
                <div className="ml-10">
                  <Button asChild variant="link" className="p-0 h-auto text-green-700 hover:text-green-800">
                    <Link href="/admissions" className="flex items-center">
                      Learn more about admissions
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2 text-green-800 dark:text-green-400 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                    <span className="text-green-700 dark:text-green-400 font-bold">Q</span>
                  </div>
                  What programs do you offer?
                </h3>
                <p className="text-muted-foreground mb-4 ml-10">
                  We offer degree, diploma, and certificate programs in sustainable agriculture, environmental science, and waste management.
                </p>
                <div className="ml-10">
                  <Button asChild variant="link" className="p-0 h-auto text-green-700 hover:text-green-800">
                    <Link href="/academics" className="flex items-center">
                      View our academic programs
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2 text-green-800 dark:text-green-400 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                    <span className="text-green-700 dark:text-green-400 font-bold">Q</span>
                  </div>
                  Is on-campus housing available?
                </h3>
                <p className="text-muted-foreground mb-4 ml-10">
                  Yes, we provide student hostels on campus with comfortable accommodations and basic amenities.
                </p>
                <div className="ml-10">
                  <Button asChild variant="link" className="p-0 h-auto text-green-700 hover:text-green-800">
                    <Link href="/campus-life" className="flex items-center">
                      Explore campus facilities
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2 text-green-800 dark:text-green-400 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                    <span className="text-green-700 dark:text-green-400 font-bold">Q</span>
                  </div>
                  What are the tuition fees?
                </h3>
                <p className="text-muted-foreground mb-4 ml-10">
                  Tuition fees vary by program. Please contact our admissions office for detailed information about fees and payment options.
                </p>
                <div className="ml-10">
                  <Button asChild variant="link" className="p-0 h-auto text-green-700 hover:text-green-800">
                    <Link href="/admissions" className="flex items-center">
                      View tuition information
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Connect With Us */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-700 text-white">Stay Connected</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Follow Us on Social Media</h2>
            <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, events, and announcements from UCAES by following us on social media.
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <a href="https://www.facebook.com/profile.php?id=100063862723517" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="rounded-full h-16 w-16 p-0 hover:bg-blue-50 hover:border-blue-300">
                <Facebook className="h-6 w-6 text-blue-600" />
              </Button>
            </a>
            <a href="https://www.instagram.com/ucaes_bunso/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="rounded-full h-16 w-16 p-0 hover:bg-pink-50 hover:border-pink-300">
                <Instagram className="h-6 w-6 text-pink-600" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 