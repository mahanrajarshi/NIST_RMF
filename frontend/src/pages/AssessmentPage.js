import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getQuestions, submitAssessment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FUNC_COLORS = {
  govern: "#002FA7",
  map: "#0F172A",
  measure: "#16A34A",
  manage: "#DC2626",
};

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const industry = searchParams.get("industry") || "technology";
  const orgName = searchParams.get("org") || "Anonymous";

  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [activeFunction, setActiveFunction] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuestions()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load questions");
        setLoading(false);
      });
  }, []);

  const functionQuestions = useMemo(() => {
    if (!data) return {};
    const grouped = {};
    data.functions.forEach((f) => {
      grouped[f.id] = data.questions.filter((q) => q.function === f.id);
    });
    return grouped;
  }, [data]);

  const categoryGroups = useMemo(() => {
    if (!data) return {};
    const grouped = {};
    data.functions.forEach((f) => {
      const fqs = functionQuestions[f.id] || [];
      const cats = {};
      fqs.forEach((q) => {
        if (!cats[q.category]) {
          cats[q.category] = { name: q.category_name, code: q.category, questions: [] };
        }
        cats[q.category].questions.push(q);
      });
      grouped[f.id] = Object.values(cats);
    });
    return grouped;
  }, [data, functionQuestions]);

  const currentFunc = data?.functions[activeFunction];
  const currentCategories = useMemo(() => {
    return currentFunc ? categoryGroups[currentFunc.id] || [] : [];
  }, [currentFunc, categoryGroups]);

  useEffect(() => {
    if (currentCategories.length > 0 && activeCategory === null) {
      setActiveCategory(0);
    }
  }, [currentCategories, activeCategory]);

  const totalQuestions = data?.total_questions || 0;
  const answeredCount = Object.keys(answers).length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const currentCategoryQuestions = activeCategory !== null && currentCategories[activeCategory]
    ? currentCategories[activeCategory].questions
    : [];

  const categoryAnswered = (cat) => {
    if (!cat) return 0;
    return cat.questions.filter((q) => answers[q.id] !== undefined).length;
  };

  const functionAnswered = (funcId) => {
    const fqs = functionQuestions[funcId] || [];
    return fqs.filter((q) => answers[q.id] !== undefined).length;
  };

  const handleAnswer = (questionId, score) => {
    setAnswers((prev) => ({ ...prev, [questionId]: parseInt(score) }));
  };

  const handleNext = () => {
    if (activeCategory < currentCategories.length - 1) {
      setActiveCategory((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeFunction < (data?.functions.length || 0) - 1) {
      setActiveFunction((prev) => prev + 1);
      setActiveCategory(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (activeCategory > 0) {
      setActiveCategory((prev) => prev - 1);
    } else if (activeFunction > 0) {
      setActiveFunction((prev) => prev - 1);
      setActiveCategory(null);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      const confirmed = window.confirm(
        `You've answered ${answeredCount} of ${totalQuestions} questions. Unanswered questions will receive a score of 1 (Initial). Continue?`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    const allAnswers = data.questions.map((q) => ({
      question_id: q.id,
      score: answers[q.id] || 1,
    }));

    try {
      const res = await submitAssessment({
        industry,
        organization_name: orgName,
        answers: allAnswers,
      });
      toast.success("Assessment submitted successfully");
      navigate(`/results/${res.data.id}?industry=${industry}`);
    } catch (err) {
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastPage =
    activeFunction === (data?.functions.length || 0) - 1 &&
    activeCategory === currentCategories.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#002FA7]" />
      </div>
    );
  }

  const maturityLabels = ["", "Initial", "Developing", "Defined", "Managed", "Optimizing"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <nav className="border-b border-border px-4 md:px-8 sticky top-0 bg-white z-50" data-testid="assessment-nav">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-70 transition-opacity" data-testid="back-to-home">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <Shield className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
            </button>
            <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              AI RMF Assessment
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="swiss-label hidden sm:block">{orgName}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{answeredCount}/{totalQuestions}</span>
              <Progress value={progressPct} className="w-24 h-2" data-testid="progress-bar" />
              <span className="font-mono text-xs text-[#002FA7]">{progressPct}%</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content: Split Rail */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left Sidebar: Navigation */}
        <aside className="lg:col-span-3 border-r border-border lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] overflow-hidden" data-testid="sidebar-nav">
          <ScrollArea className="h-full">
            <div className="p-4">
              <p className="swiss-label mb-4">Functions</p>
              {data?.functions.map((func, fi) => {
                const fAnswered = functionAnswered(func.id);
                const fTotal = (functionQuestions[func.id] || []).length;
                const isActive = fi === activeFunction;
                const isComplete = fAnswered === fTotal && fTotal > 0;
                return (
                  <div key={func.id} className="mb-3">
                    <button
                      data-testid={`nav-func-${func.id}`}
                      onClick={() => {
                        setActiveFunction(fi);
                        setActiveCategory(0);
                      }}
                      className={`
                        w-full text-left p-3 border-2 transition-all
                        ${isActive ? "border-foreground bg-secondary/30" : "border-transparent hover:border-border"}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-mono uppercase tracking-widest"
                          style={{ color: FUNC_COLORS[func.id] }}
                        >
                          {func.code}
                        </span>
                        {isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={1.5} />
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {fAnswered}/{fTotal}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {func.name}
                      </p>
                    </button>

                    {/* Category sub-nav */}
                    {isActive && (
                      <div className="ml-3 mt-1 border-l-2 border-border pl-3">
                        {(categoryGroups[func.id] || []).map((cat, ci) => {
                          const catDone = categoryAnswered(cat);
                          const isCatActive = ci === activeCategory;
                          return (
                            <button
                              key={cat.code}
                              data-testid={`nav-cat-${cat.code}`}
                              onClick={() => setActiveCategory(ci)}
                              className={`
                                w-full text-left py-2 px-2 text-xs transition-all block
                                ${isCatActive
                                  ? "text-foreground font-medium bg-secondary/40"
                                  : "text-muted-foreground hover:text-foreground"
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono">{cat.code}</span>
                                <span className="font-mono text-[10px]">
                                  {catDone}/{cat.questions.length}
                                </span>
                              </div>
                              <span className="block text-[11px] mt-0.5 truncate">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Right: Questions */}
        <main className="lg:col-span-9 p-4 md:p-8" data-testid="questions-panel">
          {currentFunc && currentCategories[activeCategory] && (
            <div className="max-w-3xl">
              {/* Category Header */}
              <div className="mb-8 fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-mono uppercase tracking-widest px-2 py-1 border"
                    style={{
                      color: FUNC_COLORS[currentFunc.id],
                      borderColor: FUNC_COLORS[currentFunc.id] + "40",
                      backgroundColor: FUNC_COLORS[currentFunc.id] + "08",
                    }}
                  >
                    {currentFunc.code} &mdash; {currentFunc.name}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {currentCategories[activeCategory].code}: {currentCategories[activeCategory].name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentCategoryQuestions.length} question{currentCategoryQuestions.length !== 1 ? "s" : ""} in this category
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {currentCategoryQuestions.map((q, qi) => (
                  <div
                    key={q.id}
                    data-testid={`question-${q.id}`}
                    className={`border-2 p-6 transition-all fade-in stagger-${qi + 1} ${
                      answers[q.id] !== undefined ? "border-green-200 bg-green-50/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm leading-relaxed">{q.question}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="shrink-0 mt-0.5" data-testid={`guidance-${q.id}`}>
                              <Info className="w-4 h-4 text-muted-foreground hover:text-[#002FA7] transition-colors" strokeWidth={1.5} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs rounded-none border-2 border-foreground bg-white text-foreground p-3">
                            <p className="text-xs">{q.guidance}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <RadioGroup
                      value={answers[q.id] !== undefined ? answers[q.id].toString() : ""}
                      onValueChange={(val) => handleAnswer(q.id, val)}
                      className="flex flex-wrap gap-2"
                      data-testid={`radio-group-${q.id}`}
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <div key={score} className="flex-1 min-w-[100px]">
                          <Label
                            htmlFor={`${q.id}-${score}`}
                            className={`
                              flex flex-col items-center p-3 border-2 cursor-pointer transition-all text-center
                              ${answers[q.id] === score
                                ? "border-[#002FA7] bg-[#002FA7]/5"
                                : "border-border hover:border-foreground"
                              }
                            `}
                          >
                            <RadioGroupItem
                              value={score.toString()}
                              id={`${q.id}-${score}`}
                              className="sr-only"
                            />
                            <span className="font-mono text-lg font-bold">{score}</span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1 leading-tight">
                              {maturityLabels[score]}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border" data-testid="nav-controls">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={activeFunction === 0 && activeCategory === 0}
                  className="border-2 border-foreground bg-transparent text-foreground h-12 px-6 rounded-none font-mono uppercase tracking-widest hover:bg-foreground hover:text-white transition-all disabled:opacity-30"
                  data-testid="prev-btn"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Previous
                </Button>

                {isLastPage ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#002FA7] text-white h-12 px-8 rounded-none font-mono uppercase tracking-widest hover:bg-[#002FA7]/90 transition-all"
                    data-testid="submit-assessment-btn"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    )}
                    Submit Assessment
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-foreground text-white h-12 px-8 rounded-none font-mono uppercase tracking-widest hover:bg-foreground/90 transition-all"
                    data-testid="next-btn"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
