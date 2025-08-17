"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Phone,
  Mail,
  Clock,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickReplies = [
  "Admission requirements",
  "Program information",
  "Fees and scholarships",
  "Campus facilities",
  "Contact admissions office"
];

const botResponses: Record<string, string> = {
  "admission requirements": "For undergraduate programs, you need WASSCE with credits in English, Mathematics, and Science subjects. International students need to provide TOEFL/IELTS certificates. Required documents include passport, proof of fee payment, application fee, declaration for financial support, photographs, health insurance, and completed application form. For postgraduate programs, you also need a research proposal outline.",
  
  "program information": "UCAES offers programs through two main faculties: Faculty of Agriculture and Rural Development, and Faculty of Environment and Conservation. Our programs combine theoretical knowledge with practical skills, following our unique educational philosophy that emphasizes investigative teaching, entrepreneurial skills, and sustainable solutions for environmental challenges. Which specific program are you interested in?",
  
  "fees and scholarships": "Tuition fees vary by program. We offer merit-based scholarships and financial aid. Our programs are designed to be accessible with private-sector initiatives to help qualified students who may not access public universities due to limited capacity. For detailed fee information, please contact our financial aid office at finance@ucaes.edu.gh.",
  
  "campus facilities": "Our campus features modern laboratories, a 200-acre demonstration farm, library, hostels, sports facilities, and research centers. Our facilities are designed to provide practical, hands-on experience in sustainable agriculture and environmental conservation. Would you like to schedule a campus tour?",
  
  "contact admissions office": "You can reach our admissions office at: Phone: +233 (0) 54 124 7178, Email: admissions@ucaes.edu.gh, Address: University College of Agriculture and Environmental Studies, P.O. Box 27, Bunso, Eastern Region, Ghana. Office hours: Monday-Friday 8:00 AM - 5:00 PM.",
  
  "history": "The University College of Agriculture and Environmental Studies (UCAES) is Africa's first university solely focused on agriculture and environmental studies. It was established by the Akyem Abuakwa Traditional Council under the visionary leadership of His Majesty, Osagyefuo Amoatia Ofori Panin, the Okyenhene. Registered in October 2006 under Ghana's Companies Code, 1963 (Act 179), UCAES bridges the gap in tertiary education for qualified students.",
  
  "programs": "We offer various programs in Agricultural Sciences, Agribusiness, Crop Science through our Faculty of Agriculture, and Environmental Science, Conservation, and Waste Management through our Faculty of Environment. Our programs are designed to produce graduates equipped with the knowledge and skills to be agents of change in environmental sustainability.",
  
  "philosophy": "Our educational philosophy is unique: 1) We educate students to understand natural systems and processes, 2) Our teaching is distinctively investigative, involving students in developing effective solutions, 3) We endow students with entrepreneurial skills for opportunities in environment and agriculture, 4) We offer complementary IT certification alongside degree programs.",
  
  "location": "UCAES is located in Bunso, Eastern Region, Ghana. Our address is: University College of Agriculture and Environmental Studies, P.O. Box 27, Bunso, Eastern Region, Ghana.",
  
  "application": "You can apply to UCAES through our online application portal. Required documents include passport, application fee payment proof, English proficiency certificates (for international students), declaration for financial support, photographs, and health insurance. For more details, visit our Apply page or contact admissions at admissions@ucaes.edu.gh.",
  
  "default": "Thank you for your question! For detailed information, please contact our admissions office at admissions@ucaes.edu.gh or call +233 (0) 54 124 7178. Our team will be happy to assist you."
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to UCAES. I'm here to help you with information about our programs, admissions, and campus life. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = botResponses.default;

      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 sm:w-96 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        <CardHeader className="p-4 bg-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-white/20 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">UCAES Assistant</CardTitle>
                <div className="flex items-center space-x-1 text-xs text-white/80">
                  <div className="h-2 w-2 bg-green-400 rounded-full" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`p-2 rounded-full ${
                        message.sender === 'user' ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="p-2 rounded-full bg-muted">
                        <Bot className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Replies */}
            <div className="p-3 border-t bg-muted/30">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors text-xs"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Contact Options */}
              <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>+233 (0) 54 124 7178</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>info@ucaes.edu.gh</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>24/7</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}