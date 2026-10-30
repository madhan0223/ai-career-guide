import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Target, Loader2, CheckCircle2, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SkillRating {
  name: string;
  rating: number;
}

interface AnalysisResult {
  successScore: number;
  skillMatch: { skill: string; userLevel: number; requiredLevel: number }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const defaultSkills: SkillRating[] = [
  { name: "Python", rating: 5 },
  { name: "Machine Learning", rating: 5 },
  { name: "SQL", rating: 5 },
  { name: "Communication", rating: 5 },
  { name: "Leadership", rating: 5 },
  { name: "Problem Solving", rating: 5 },
];

const InterviewPredictor = () => {
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillRating[]>(defaultSkills);
  const [cgpa, setCgpa] = useState([7]);
  const [projects, setProjects] = useState([5]);
  const [communication, setCommunication] = useState([7]);
  const [internship, setInternship] = useState([6]);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const updateSkillRating = (skillName: string, newRating: number) => {
    setSkills(skills.map(s => 
      s.name === skillName ? { ...s, rating: newRating } : s
    ));
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please paste a job description to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("career-ai-analysis", {
        body: {
          type: "interview-predictor",
          data: {
            skills: skills.map(s => ({ name: s.name, rating: s.rating })),
            cgpa: cgpa[0],
            projects: projects[0],
            communication: communication[0],
            internshipMonths: internship[0],
            jobDescription,
          },
        },
      });

      if (error) throw error;

      setResult(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-career-salary";
    if (score >= 60) return "text-career-skills";
    if (score >= 40) return "text-yellow-600";
    return "text-destructive";
  };

  const getBarColor = (userLevel: number, requiredLevel: number) => {
    const ratio = userLevel / requiredLevel;
    if (ratio >= 1) return "hsl(142, 76%, 36%)";
    if (ratio >= 0.7) return "hsl(199, 89%, 48%)";
    if (ratio >= 0.5) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
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
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Interview Performance Predictor</h1>
              <p className="text-muted-foreground">Analyze your profile against job requirements</p>
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
                <CardDescription>Rate your proficiency in each skill (1-10)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{skill.name}</Label>
                      <span className="text-sm font-medium text-primary">{skill.rating}/10</span>
                    </div>
                    <Slider
                      value={[skill.rating]}
                      onValueChange={([v]) => updateSkillRating(skill.name, v)}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Provide additional information about your background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>CGPA</Label>
                    <span className="text-sm font-medium text-primary">{cgpa[0]}/10</span>
                  </div>
                  <Slider value={cgpa} onValueChange={setCgpa} min={0} max={10} step={0.1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Number of Projects</Label>
                    <span className="text-sm font-medium text-primary">{projects[0]}</span>
                  </div>
                  <Slider value={projects} onValueChange={setProjects} min={0} max={20} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Communication Level</Label>
                    <span className="text-sm font-medium text-primary">{communication[0]}/10</span>
                  </div>
                  <Slider value={communication} onValueChange={setCommunication} min={1} max={10} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Internship Experience</Label>
                    <span className="text-sm font-medium text-primary">{internship[0]} months</span>
                  </div>
                  <Slider value={internship} onValueChange={setInternship} min={0} max={48} step={1} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the job description you're targeting</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Your Profile...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Interview Success
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {isLoading && (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            )}

            {result && !isLoading && (
              <>
                {/* Success Score */}
                <Card className="border-2 border-primary/20">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">Interview Success Probability</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(result.successScore)}`}>
                      {result.successScore}%
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {result.successScore >= 80 ? "Excellent match!" : 
                       result.successScore >= 60 ? "Good potential" : 
                       result.successScore >= 40 ? "Room for improvement" : "Focus on preparation"}
                    </p>
                  </CardContent>
                </Card>

                {/* Skill Match Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Skill Match Breakdown
                    </CardTitle>
                    <CardDescription>Your skills vs. job requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.skillMatch} layout="vertical" margin={{ left: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 10]} />
                          <YAxis dataKey="skill" type="category" tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="userLevel" name="Your Level" radius={[0, 4, 4, 0]}>
                            {result.skillMatch.map((entry, index) => (
                              <Cell key={index} fill={getBarColor(entry.userLevel, entry.requiredLevel)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-career-salary">
                        <CheckCircle2 className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-career-salary mt-1">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-destructive mt-1">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Preparation Recommendations
                    </CardTitle>
                    <CardDescription>Actionable steps to improve your chances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                          <Badge variant="secondary" className="mt-0.5">{i + 1}</Badge>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Fill in your skills and profile details, paste a job description, and click analyze to get AI-powered insights.
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

export default InterviewPredictor;
