import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getAssessment, getRecommendations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import {
  Shield,
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Target,
  TrendingUp,
  Loader2,
  ChevronRight,
  BookOpen,
  Printer,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

const SEVERITY_STYLES = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const MATURITY_COLORS = {
  Initial: "#DC2626",
  Developing: "#F59E0B",
  Defined: "#3B82F6",
  Managed: "#16A34A",
  Optimizing: "#8B5CF6",
};

const FUNC_LABELS = {
  govern: "GOVERN",
  map: "MAP",
  measure: "MEASURE",
  manage: "MANAGE",
};

export default function ResultsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const industry = searchParams.get("industry") || "technology";

  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    Promise.all([
      getAssessment(id),
      getRecommendations(industry),
    ])
      .then(([resResult, resRecs]) => {
        setResult(resResult.data);
        setRecommendations(resRecs.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load results");
        setLoading(false);
      });
  }, [id, industry]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#002FA7]" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
        <p className="text-lg">Assessment not found</p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-none border-2" data-testid="go-home-btn">
          Go Home
        </Button>
      </div>
    );
  }

  const overallColor = MATURITY_COLORS[result.overall_maturity] || "#0F172A";

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Nav */}
      <nav className="border-b border-border px-4 md:px-8 print:hidden sticky top-0 bg-white z-50" data-testid="results-nav">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-70 transition-opacity" data-testid="back-home-btn">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <Shield className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
            </button>
            <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Assessment Results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-none border-2 font-mono text-xs uppercase tracking-widest h-9"
              data-testid="print-btn"
            >
              <Printer className="w-3 h-3 mr-2" strokeWidth={1.5} /> Print
            </Button>
            <Button
              onClick={() => navigate("/")}
              size="sm"
              className="bg-[#002FA7] text-white rounded-none font-mono text-xs uppercase tracking-widest h-9 hover:bg-[#002FA7]/90"
              data-testid="new-assessment-btn"
            >
              New Assessment
            </Button>
          </div>
        </div>
      </nav>

      {/* Header Metrics */}
      <section className="border-b border-border grid-texture" data-testid="results-header">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-2 mb-4">
            <p className="swiss-label">{result.organization_name}</p>
            <span className="text-muted-foreground text-xs">/</span>
            <p className="swiss-label capitalize">{result.industry}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Overall Score */}
            <div className="col-span-2 md:col-span-1 border-2 border-foreground p-5 bg-white" data-testid="overall-score-card">
              <p className="swiss-label mb-1">Overall Score</p>
              <p className="text-5xl font-extrabold tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif', color: overallColor }}>
                {result.overall_score}%
              </p>
              <p className="text-sm font-medium mt-1" style={{ color: overallColor }}>{result.overall_maturity}</p>
            </div>
            {/* Function Scores */}
            {Object.entries(result.function_scores).map(([key, val]) => (
              <div key={key} className="border border-border p-4 bg-white hover-lift" data-testid={`func-score-${key}`}>
                <p className="swiss-label mb-1" style={{ color: val.color }}>{val.code}</p>
                <p className="text-3xl font-extrabold tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {val.score_pct}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{val.maturity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 print:hidden" data-testid="results-tabs">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
            {[
              { value: "overview", label: "Overview", icon: BarChart3 },
              { value: "actions", label: "Priority Actions", icon: Target },
              { value: "recommendations", label: "Industry Guidance", icon: BookOpen },
              { value: "details", label: "Category Details", icon: TrendingUp },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-testid={`tab-${tab.value}`}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#002FA7] data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all"
              >
                <tab.icon className="w-3 h-3 mr-2" strokeWidth={1.5} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radar Chart */}
              <div className="lg:col-span-7 border border-border p-6" data-testid="radar-chart-container">
                <p className="swiss-label mb-4">Compliance Radar</p>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={result.radar_data}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis
                        dataKey="function"
                        tick={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", fill: "#0F172A" }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#0F172A"
                        strokeWidth={3}
                        fill="#0F172A"
                        fillOpacity={0.1}
                      />
                      <RTooltip
                        contentStyle={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          borderRadius: 0,
                          border: "2px solid #0F172A",
                        }}
                        formatter={(value) => [`${value}%`, "Score"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Maturity Breakdown */}
              <div className="lg:col-span-5 space-y-4" data-testid="maturity-breakdown">
                <p className="swiss-label mb-2">Function Maturity</p>
                {Object.entries(result.function_scores).map(([key, val]) => {
                  const matColor = MATURITY_COLORS[val.maturity] || "#0F172A";
                  return (
                    <div key={key} className="border border-border p-4 hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: val.color }}>
                          {val.code} &mdash; {val.name}
                        </span>
                        <Badge variant="outline" className="rounded-none font-mono text-[10px] border-2" style={{ color: matColor, borderColor: matColor }}>
                          {val.maturity}
                        </Badge>
                      </div>
                      <div className="w-full bg-secondary h-3 overflow-hidden">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${val.score_pct}%`, backgroundColor: val.color }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-mono text-xs text-muted-foreground">Avg: {val.avg_score}/5</span>
                        <span className="font-mono text-xs font-medium">{val.score_pct}%</span>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Stats */}
                <div className="border-2 border-foreground p-4 mt-4" data-testid="quick-stats">
                  <p className="swiss-label mb-3">Assessment Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Critical Actions</span>
                      <span className="font-mono text-sm font-medium text-red-600">
                        {result.priority_actions.filter((a) => a.severity === "critical").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">High Priority</span>
                      <span className="font-mono text-sm font-medium text-amber-600">
                        {result.priority_actions.filter((a) => a.severity === "high").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Actions</span>
                      <span className="font-mono text-sm font-medium">{result.priority_actions.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Priority Actions Tab */}
          <TabsContent value="actions" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Priority Action Items
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Actions are ranked by severity and current gap. Address critical items first.
              </p>
            </div>

            {result.priority_actions.length === 0 ? (
              <div className="border border-border p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>Excellent Compliance</p>
                <p className="text-sm text-muted-foreground mt-1">No immediate action items identified. Keep up the great work!</p>
              </div>
            ) : (
              <div className="space-y-4" data-testid="actions-list">
                {result.priority_actions.map((action, i) => (
                  <div
                    key={action.id}
                    data-testid={`action-${action.id}`}
                    className={`border-2 p-5 fade-in ${SEVERITY_STYLES[action.severity] || "border-border"}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`rounded-none font-mono text-[10px] uppercase tracking-widest border-2 ${SEVERITY_STYLES[action.severity]}`}
                      >
                        {action.severity}
                      </Badge>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {action.category} &mdash; {FUNC_LABELS[action.function] || action.function}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{action.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="font-mono text-xs">{action.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="font-mono text-xs">{action.resources}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="font-mono text-xs">
                          Current: {action.current_score.toFixed(1)} / Target: {action.target_score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Industry Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            {recommendations ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest border-2">
                      {recommendations.code}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {recommendations.name} Sector Guidance
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendations.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recommendations.regulations.map((reg) => (
                      <span key={reg} className="font-mono text-[10px] px-2 py-1 border-2 border-border bg-secondary/50 uppercase tracking-widest">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4" data-testid="recommendations-list">
                  {recommendations.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      data-testid={`rec-${i}`}
                      className="border border-border p-5 hover-lift"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border"
                          style={{
                            color: rec.function === "govern" ? "#002FA7" : rec.function === "map" ? "#0F172A" : rec.function === "measure" ? "#16A34A" : "#DC2626",
                            borderColor: (rec.function === "govern" ? "#002FA7" : rec.function === "map" ? "#0F172A" : rec.function === "measure" ? "#16A34A" : "#DC2626") + "40",
                          }}
                        >
                          {FUNC_LABELS[rec.function] || rec.function}
                        </span>
                        <Badge
                          variant="outline"
                          className={`rounded-none font-mono text-[10px] uppercase tracking-widest border-2 ${SEVERITY_STYLES[rec.priority]}`}
                        >
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest border-2">
                          Effort: {rec.effort}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {rec.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-border p-8 text-center">
                <p className="text-muted-foreground">No industry-specific recommendations available.</p>
              </div>
            )}
          </TabsContent>

          {/* Category Details Tab */}
          <TabsContent value="details" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Category Breakdown
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Detailed scores for all 19 assessment categories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="category-details">
              {Object.entries(result.category_scores).map(([code, cat]) => {
                const matColor = MATURITY_COLORS[cat.maturity] || "#0F172A";
                const funcData = result.function_scores[cat.function];
                return (
                  <div key={code} className="border border-border p-4 hover-lift" data-testid={`cat-detail-${code}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{code}</span>
                        <h4 className="font-semibold text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>{cat.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xl font-bold">{cat.score_pct}%</span>
                        <Badge variant="outline" className="ml-2 rounded-none font-mono text-[10px] border" style={{ color: matColor, borderColor: matColor }}>
                          {cat.maturity}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-secondary h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${cat.score_pct}%`,
                          backgroundColor: funcData?.color || "#0F172A",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground mt-1 block">Avg: {cat.avg_score}/5</span>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print-only content */}
      <div className="hidden print:block px-8 py-6">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          NIST AI RMF Assessment Report
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {result.organization_name} / {result.industry} / {result.created_at}
        </p>
        <p className="text-xl font-bold">Overall: {result.overall_score}% - {result.overall_maturity}</p>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-4 md:px-8 py-6 mt-8 print:hidden">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <span className="swiss-label">NIST AI RMF Auditor</span>
          <span className="swiss-label">Assessment ID: {id?.slice(0, 8)}</span>
        </div>
      </footer>
    </div>
  );
}
