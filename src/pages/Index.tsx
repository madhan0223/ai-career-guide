import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Search, DollarSign, Compass, ArrowRight, Sparkles } from "lucide-react";

const tools = [
  {
    id: "interview-predictor",
    title: "Interview Performance Predictor",
    description: "Analyze your skills against job requirements and get AI-powered predictions for interview success with personalized preparation tips.",
    icon: Target,
    path: "/tools/interview-predictor",
    featured: true,
    color: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
  },
  {
    id: "skill-gap-finder",
    title: "Skill Gap Finder",
    description: "Compare your current skills to job requirements and discover exactly what you need to learn with curated learning recommendations.",
    icon: Search,
    path: "/tools/skill-gap-finder",
    featured: false,
    color: "bg-career-skills/10 text-career-skills",
    borderColor: "border-career-skills/20",
  },
  {
    id: "salary-predictor",
    title: "Salary Predictor",
    description: "Get AI-powered salary estimates based on your skills, experience, and target role with market comparison insights.",
    icon: DollarSign,
    path: "/tools/salary-predictor",
    featured: false,
    color: "bg-career-salary/10 text-career-salary",
    borderColor: "border-career-salary/20",
  },
  {
    id: "career-suggester",
    title: "Career Suggester",
    description: "Discover the best career paths matching your skills, degree, and interests with detailed roadmaps for each recommendation.",
    icon: Compass,
    path: "/tools/career-suggester",
    featured: false,
    color: "bg-career-career/10 text-career-career",
    borderColor: "border-career-career/20",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b bg-gradient-to-b from-accent/50 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Career Tools
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              AI Career Toolkit
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Prepare for interviews, identify skill gaps, estimate salaries, and discover your ideal career path — all powered by advanced AI analysis.
            </p>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  tool.featured ? `border-2 ${tool.borderColor}` : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tool.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={tool.path}>
                    <Button className="w-full group-hover:bg-primary/90" size="lg">
                      Launch Tool
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            All predictions and recommendations are AI-generated estimates. Use these insights as guidance alongside your own research and professional advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
