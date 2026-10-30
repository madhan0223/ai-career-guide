import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign, Loader2, TrendingUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const skillOptions = [
  "Data Science", "Machine Learning", "Python", "JavaScript", "TypeScript",
  "React", "Node.js", "SQL", "Cloud Computing", "DevOps",
  "AWS", "Azure", "Docker", "Kubernetes", "Data Engineering",
  "Product Management", "Project Management", "UI/UX Design"
];

const regions = [
  "United States", "United Kingdom", "Germany", "Canada", "Australia",
  "India", "Remote/Global"
];

interface AnalysisResult {
  salaryMin: number;
  salaryMax: number;
  salaryMedian: number;
  marketComparison: { category: string; salary: number }[];
  factors: string[];
  growthTips: string[];
}

const SalaryPredictor = () => {
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState([5]);
  const [jobTitle, setJobTitle] = useState("");
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedSkills.length === 0 || !jobTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select at least one skill and enter a job title.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("career-ai-analysis", {
        body: {
          type: "salary-predictor",
          data: {
            skills: selectedSkills,
            yearsExperience: experience[0],
            jobTitle,
            region: region || "United States",
          },
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to predict salary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
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
            <div className="w-12 h-12 rounded-lg bg-career-salary/10 text-career-salary flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Salary Predictor</h1>
              <p className="text-muted-foreground">Estimate your market value</p>
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
                <CardDescription>Select all skills that apply to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience & Role</CardTitle>
                <CardDescription>Tell us about your background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Years of Experience</Label>
                    <span className="text-sm font-medium text-primary">{experience[0]} years</span>
                  </div>
                  <Slider value={experience} onValueChange={setExperience} min={0} max={30} step={1} />
                </div>
                
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    placeholder="e.g., Senior Software Engineer, Data Scientist"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Region (Optional)</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating Salary...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Predict Salary
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
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            )}

            {result && !isLoading && (
              <>
                {/* Salary Range */}
                <Card className="border-2 border-career-salary/20">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">Predicted Salary Range</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-5xl font-bold text-career-salary">
                      {formatSalary(result.salaryMedian)}
                    </div>
                    <p className="text-lg text-muted-foreground mt-2">
                      {formatSalary(result.salaryMin)} - {formatSalary(result.salaryMax)} / year
                    </p>
                  </CardContent>
                </Card>

                {/* Market Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Market Comparison
                    </CardTitle>
                    <CardDescription>How you compare to the market</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.marketComparison} layout="vertical" margin={{ left: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(v) => `$${v/1000}k`} />
                          <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => formatSalary(value)} />
                          <Bar dataKey="salary" radius={[0, 4, 4, 0]}>
                            {result.marketComparison.map((entry, index) => (
                              <Cell 
                                key={index} 
                                fill={entry.category === "Your Estimate" ? "hsl(142, 76%, 36%)" : "hsl(199, 89%, 48%)"} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Factors Affecting Your Salary</CardTitle>
                    <CardDescription>What's driving this estimate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.factors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-career-salary mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Growth Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Tips to Increase Earning Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.growthTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                          <Badge variant="secondary" className="mt-0.5">{i + 1}</Badge>
                          <span className="text-sm">{tip}</span>
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
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Predict</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Select your skills, experience level, and target role to get a salary estimate.
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

export default SalaryPredictor;
