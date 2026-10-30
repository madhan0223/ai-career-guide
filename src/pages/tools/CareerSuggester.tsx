import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Compass, Loader2, MapPin, Star, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const degrees = [
  "B.Tech Computer Science",
  "B.Tech Electronics",
  "B.Sc Computer Science",
  "B.Sc Mathematics",
  "B.Sc Physics",
  "BBA",
  "B.Com",
  "BA Economics",
  "Other Engineering",
  "Other Science",
  "Other Arts",
];

const interestOptions = [
  "AI/Machine Learning",
  "Web Development",
  "Mobile Development",
  "Data Analysis",
  "Cloud Computing",
  "Cybersecurity",
  "Finance/FinTech",
  "Game Development",
  "DevOps",
  "Product Management",
  "UI/UX Design",
  "Research/Academia",
];

interface CareerMatch {
  title: string;
  fitPercentage: number;
  whyItFits: string;
  roadmap: string[];
  skillsToLearn: string[];
}

interface AnalysisResult {
  careers: CareerMatch[];
}

const CareerSuggester = () => {
  const { toast } = useToast();
  const [skills, setSkills] = useState("");
  const [degree, setDegree] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleAnalyze = async () => {
    if (!skills.trim() || !degree || selectedInterests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in your skills, degree, and select at least one interest.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("career-ai-analysis", {
        body: {
          type: "career-suggester",
          data: {
            skills: skills.split(",").map(s => s.trim()).filter(Boolean),
            degree,
            interests: selectedInterests,
          },
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate career suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFitColor = (percentage: number) => {
    if (percentage >= 85) return "text-career-salary bg-career-salary/10";
    if (percentage >= 70) return "text-career-skills bg-career-skills/10";
    return "text-career-career bg-career-career/10";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-career-career/10 text-career-career flex items-center justify-center">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Career Suggester</h1>
              <p className="text-muted-foreground">Discover your ideal career path</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>Enter your current skills separated by commas</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., Python, Excel, Communication, Problem Solving"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Degree</CardTitle>
                <CardDescription>Select your educational background</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={degree} onValueChange={setDegree}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degrees.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Interests</CardTitle>
                <CardDescription>Select areas that excite you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Your Career Path...
                </>
              ) : (
                <>
                  <Compass className="mr-2 h-4 w-4" />
                  Suggest Careers
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Top Career Matches</h2>
                {result.careers.map((career, index) => (
                  <Card key={index} className={index === 0 ? "border-2 border-career-salary/30" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {index === 0 && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                          <CardTitle className="text-xl">{career.title}</CardTitle>
                        </div>
                        <Badge className={`text-lg px-3 py-1 ${getFitColor(career.fitPercentage)}`}>
                          {career.fitPercentage}% fit
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Why It Fits */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-career-career" />
                          Why This Fits You
                        </h4>
                        <p className="text-sm text-muted-foreground">{career.whyItFits}</p>
                      </div>

                      {/* Career Roadmap */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-career-career" />
                          Career Roadmap
                        </h4>
                        <div className="space-y-2">
                          {career.roadmap.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                                {i + 1}
                              </div>
                              <p className="text-sm pt-0.5">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills to Develop */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-career-career" />
                          Skills to Develop
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {career.skillsToLearn.map((skill, i) => (
                            <Badge key={i} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!result && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Explore</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Enter your skills, degree, and interests to discover career paths that match your profile.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CareerSuggester;
