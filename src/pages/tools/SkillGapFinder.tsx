import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Loader2, BookOpen, AlertTriangle, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AnalysisResult {
  gapScore: number;
  missingSkills: { skill: string; importance: string; priority: number }[];
  matchedSkills: string[];
  learningRecommendations: { skill: string; resources: string[] }[];
}

const SkillGapFinder = () => {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !currentSkills.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a job description and your current skills.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("career-ai-analysis", {
        body: {
          type: "skill-gap-finder",
          data: {
            jobDescription,
            currentSkills: currentSkills.split(",").map(s => s.trim()).filter(Boolean),
          },
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze skill gaps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "bg-destructive text-destructive-foreground";
    if (priority === 2) return "bg-yellow-500 text-white";
    return "bg-muted text-muted-foreground";
  };

  const chartData = result ? [
    { name: "Skills You Have", value: result.matchedSkills.length, color: "hsl(142, 76%, 36%)" },
    { name: "Skills to Learn", value: result.missingSkills.length, color: "hsl(199, 89%, 48%)" },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-career-skills/10 text-career-skills flex items-center justify-center">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Skill Gap Finder</h1>
              <p className="text-muted-foreground">Identify what skills you need to learn</p>
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
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the job posting you're interested in</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Your Current Skills</CardTitle>
                <CardDescription>Enter your skills separated by commas</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., Python, JavaScript, SQL, Machine Learning, Data Analysis"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Be specific! Include tools, frameworks, and soft skills.
                </p>
              </CardContent>
            </Card>

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Skill Gaps...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Skill Gaps
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            )}

            {result && !isLoading && (
              <>
                {/* Gap Score */}
                <Card className="border-2 border-career-skills/20">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">Skill Gap Score</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-6xl font-bold ${result.gapScore <= 30 ? "text-career-salary" : result.gapScore <= 60 ? "text-career-skills" : "text-destructive"}`}>
                      {result.gapScore}%
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {result.gapScore <= 30 ? "Great match! Few gaps to fill." : 
                       result.gapScore <= 60 ? "Moderate gaps to address." : "Significant learning needed."}
                    </p>
                  </CardContent>
                </Card>

                {/* Skills Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-career-skills" />
                      Skills to Learn
                    </CardTitle>
                    <CardDescription>Prioritized by importance for the role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.missingSkills.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                          <div className="flex items-center gap-3">
                            <Badge className={getPriorityColor(skill.priority)}>
                              P{skill.priority}
                            </Badge>
                            <span className="font-medium">{skill.skill}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{skill.importance}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Matched Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-career-salary">
                      <BookOpen className="h-5 w-5" />
                      Skills You Already Have
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-career-salary/10 text-career-salary border-career-salary/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Learning Recommendations
                    </CardTitle>
                    <CardDescription>Curated resources for each skill gap</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.learningRecommendations.map((rec, i) => (
                        <div key={i} className="p-4 rounded-lg border">
                          <h4 className="font-semibold mb-2">{rec.skill}</h4>
                          <ul className="space-y-1">
                            {rec.resources.map((resource, j) => (
                              <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">→</span>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!result && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Find Gaps</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Paste a job description and your skills to discover what you need to learn.
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

export default SkillGapFinder;
