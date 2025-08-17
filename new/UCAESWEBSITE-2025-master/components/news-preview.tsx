import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, User } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    title: "UCAES Wins National Agricultural Innovation Award",
    excerpt: "Our research team's groundbreaking work in sustainable farming practices has been recognized at the national level.",
    image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Achievement",
    date: "March 10, 2024",
    author: "Dr. Sarah Mensah"
  },
  {
    id: 2,
    title: "New Partnership with International Agricultural Organization",
    excerpt: "UCAES signs MOU with FAO to enhance research collaboration and student exchange programs.",
    image: "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Partnership",
    date: "March 8, 2024",
    author: "Prof. Emmanuel Asante"
  },
  {
    id: 3,
    title: "Students Excel in Regional Agricultural Competition",
    excerpt: "UCAES students secure top positions in the West African Agricultural Innovation Challenge.",
    image: "https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Student Achievement",
    date: "March 5, 2024",
    author: "Student Affairs Office"
  }
];

export function NewsPreview() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-4">Latest News</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Stay Updated with UCAES
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keep up with the latest developments, achievements, and opportunities at our university.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsItems.map((item, index) => (
            <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 animate-fade-in overflow-hidden border-0 bg-background">
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {item.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                  Read More
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/news">
              View All News & Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}