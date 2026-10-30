import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "interview-predictor") {
      systemPrompt = `You are an expert career coach and interview success predictor. Analyze the candidate's profile against the job description and provide actionable insights. Be encouraging but realistic. Always respond with valid JSON.`;
      
      userPrompt = `Analyze this candidate for interview success:

CANDIDATE PROFILE:
- Skills: ${data.skills.map((s: {name: string, rating: number}) => `${s.name} (${s.rating}/10)`).join(", ")}
- CGPA: ${data.cgpa}/10
- Projects: ${data.projects}
- Communication Level: ${data.communication}/10
- Internship Experience: ${data.internshipMonths} months

JOB DESCRIPTION:
${data.jobDescription}

Respond with JSON in this exact format:
{
  "successScore": <number 0-100>,
  "skillMatch": [
    {"skill": "<skill name>", "userLevel": <1-10>, "requiredLevel": <1-10>}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<area to improve 1>", "<area to improve 2>"],
  "recommendations": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>", "<actionable tip 4>"]
}

Include 4-6 skills in skillMatch based on what's relevant to the job. Be specific with recommendations.`;
    } else if (type === "skill-gap-finder") {
      systemPrompt = `You are an expert career skills analyst. Compare the candidate's skills against job requirements and provide learning recommendations. Always respond with valid JSON.`;
      
      userPrompt = `Analyze skill gaps for this candidate:

CURRENT SKILLS: ${data.currentSkills.join(", ")}

JOB DESCRIPTION:
${data.jobDescription}

Respond with JSON in this exact format:
{
  "gapScore": <number 0-100 representing percentage of missing skills>,
  "missingSkills": [
    {"skill": "<skill name>", "importance": "<Critical/Important/Nice to have>", "priority": <1-3>}
  ],
  "matchedSkills": ["<matched skill 1>", "<matched skill 2>"],
  "learningRecommendations": [
    {"skill": "<skill name>", "resources": ["<specific course or resource>", "<book or tutorial>"]}
  ]
}

Prioritize the most important missing skills. Include 3-5 learning recommendations with specific resources.`;
    } else if (type === "salary-predictor") {
      systemPrompt = `You are an expert compensation analyst. Predict realistic salary ranges based on skills, experience, and market data. Always respond with valid JSON.`;
      
      userPrompt = `Predict salary for this candidate:

SKILLS: ${data.skills.join(", ")}
YEARS OF EXPERIENCE: ${data.yearsExperience}
JOB TITLE: ${data.jobTitle}
REGION: ${data.region}

Respond with JSON in this exact format:
{
  "salaryMin": <number in USD>,
  "salaryMax": <number in USD>,
  "salaryMedian": <number in USD>,
  "marketComparison": [
    {"category": "Your Estimate", "salary": <number>},
    {"category": "Junior Level", "salary": <number>},
    {"category": "Mid Level", "salary": <number>},
    {"category": "Senior Level", "salary": <number>}
  ],
  "factors": ["<factor affecting salary 1>", "<factor affecting salary 2>", "<factor affecting salary 3>"],
  "growthTips": ["<tip to increase salary 1>", "<tip to increase salary 2>", "<tip to increase salary 3>"]
}

Provide realistic salary ranges for 2024-2025 market. Consider the region when estimating.`;
    } else if (type === "career-suggester") {
      systemPrompt = `You are an expert career counselor for freshers. Suggest the best career paths based on skills, education, and interests. Always respond with valid JSON.`;
      
      userPrompt = `Suggest career paths for this fresher:

SKILLS: ${data.skills.join(", ")}
DEGREE: ${data.degree}
INTERESTS: ${data.interests.join(", ")}

Respond with JSON in this exact format:
{
  "careers": [
    {
      "title": "<career title>",
      "fitPercentage": <number 0-100>,
      "whyItFits": "<2-3 sentence explanation>",
      "roadmap": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"],
      "skillsToLearn": ["<skill 1>", "<skill 2>", "<skill 3>"]
    }
  ]
}

Suggest exactly 3 careers ranked by fit. Be specific about roadmap steps (e.g., "Complete AWS certification" not just "Learn cloud").`;
    } else {
      throw new Error(`Unknown analysis type: ${type}`);
    }

    console.log(`Processing ${type} analysis request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received, parsing JSON...");

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const parsedResult = JSON.parse(jsonContent);
    console.log(`Successfully parsed ${type} result`);

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Career AI analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
