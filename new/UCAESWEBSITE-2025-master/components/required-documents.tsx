import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileCheck, Download } from 'lucide-react';

const requiredDocuments = [
  { document: "Passport", description: "Valid international passport with at least 6 months validity" },
  { document: "Proof of fee payment", description: "Receipt of application fee payment" },
  { document: "TOEFL Certificate", description: "For international students from non-English speaking countries" },
  { document: "Application fee", description: "Non-refundable application processing fee" },
  { document: "Declaration for financial support", description: "Proof of financial capability to fund your studies" },
  { document: "IELTS Certificate", description: "Alternative English proficiency proof for international students" },
  { document: "Photographs", description: "Recent passport-sized photographs with white background" },
  { document: "Student visa", description: "For international students (can be obtained after acceptance)" },
  { document: "Health and Life Insurance", description: "Valid health insurance coverage for duration of study" },
  { document: "Research proposal outline", description: "Required for MA and PhD applicants only" },
  { document: "Online Application form", description: "Completed application form from our admissions portal" },
];

export function RequiredDocuments() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-4 bg-green-700 text-white">Admissions</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Required Documents for Admission
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            When applying for admission to University College of Agriculture and Environmental Studies, 
            prepare all required documents listed below. Document requirements may vary for different countries, 
            so contact admissions for specific details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {requiredDocuments.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 animate-fade-in border-l-4 border-green-600">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="mt-1 bg-green-100 rounded-full p-2 flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.document}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-lg max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-xl mb-2">Need more information?</h3>
              <p className="text-muted-foreground">
                Contact our admissions office for specific requirements based on your country and program.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-green-700 hover:bg-green-800 text-white">
                <Link href="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
                <Link href="/contact">
                  Contact Admissions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 