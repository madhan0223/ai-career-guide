import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InterviewPredictor from "./pages/tools/InterviewPredictor";
import SkillGapFinder from "./pages/tools/SkillGapFinder";
import SalaryPredictor from "./pages/tools/SalaryPredictor";
import CareerSuggester from "./pages/tools/CareerSuggester";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/interview-predictor" element={<InterviewPredictor />} />
          <Route path="/tools/skill-gap-finder" element={<SkillGapFinder />} />
          <Route path="/tools/salary-predictor" element={<SalaryPredictor />} />
          <Route path="/tools/career-suggester" element={<CareerSuggester />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
