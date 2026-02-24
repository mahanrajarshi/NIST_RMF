import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIndustries } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  ArrowRight,
  Building2,
  Heart,
  Landmark,
  Swords,
  Cpu,
  Zap,
  GraduationCap,
  ChevronRight,
  BarChart3,
  Target,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const INDUSTRY_ICONS = {
  healthcare: Heart,
  finance: Landmark,
  government: Building2,
  defense: Swords,
  technology: Cpu,
  energy: Zap,
  education: GraduationCap,
};

const INDUSTRY_IMAGES = {
  healthcare: "https://images.unsplash.com/photo-1769147555720-71fc71bfc216?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGJ1aWxkaW5nJTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3MTkwOTA0OXww&ixlib=rb-4.1.0&q=85",
  finance: "https://images.pexels.com/photos/1102845/pexels-photo-1102845.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  government: "https://images.pexels.com/photos/18327426/pexels-photo-18327426.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  defense: "https://images.pexels.com/photos/18327426/pexels-photo-18327426.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  technology: "https://images.pexels.com/photos/17489158/pexels-photo-17489158.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  energy: "https://images.unsplash.com/photo-1765263857986-271b4923632d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxlbmVyZ3klMjB3aW5kJTIwdHVyYmluZSUyMHNvbGFyJTIwcGFuZWx8ZW58MHx8fHwxNzcxOTA5MDUzfDA&ixlib=rb-4.1.0&q=85",
  education: "https://images.pexels.com/photos/12091126/pexels-photo-12091126.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIndustries()
      .then((res) => {
        setIndustries(res.data.industries);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load industries");
        setLoading(false);
      });
  }, []);

  const handleStart = () => {
    if (!selectedIndustry) {
      toast.error("Please select your industry to proceed");
      return;
    }
    navigate(`/assessment?industry=${encodeURIComponent(selectedIndustry)}&org=${encodeURIComponent(orgName || "Anonymous")}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-border px-4 md:px-8" data-testid="top-nav">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#002FA7]" strokeWidth={1.5} />
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              NIST AI RMF Auditor
            </span>
          </div>
          <span className="swiss-label hidden sm:block">Compliance Assessment Platform</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grid-texture border-b border-border" data-testid="hero-section">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Hero Text */}
            <div className="lg:col-span-8 flex flex-col justify-center fade-in">
              <p className="swiss-label mb-4">NIST AI Risk Management Framework</p>
              <h1
                className="text-5xl md:text-7xl tracking-tighter font-extrabold leading-[0.95] mb-6"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                AI Compliance
                <br />
                Assessment
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Evaluate your organization's AI risk management maturity across the four core NIST AI RMF functions. Get actionable insights, industry-specific recommendations, and a clear compliance roadmap.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Radar Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Priority Actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Industry Guidance</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="lg:col-span-4 flex flex-col gap-4 fade-in stagger-2">
              <div className="border border-border p-6 bg-white hover-lift">
                <p className="swiss-label mb-2">Functions</p>
                <p className="text-4xl font-extrabold tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>4</p>
                <p className="text-sm text-muted-foreground mt-1">Govern, Map, Measure, Manage</p>
              </div>
              <div className="border border-border p-6 bg-white hover-lift">
                <p className="swiss-label mb-2">Categories</p>
                <p className="text-4xl font-extrabold tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>19</p>
                <p className="text-sm text-muted-foreground mt-1">Comprehensive coverage</p>
              </div>
              <div className="border border-border p-6 bg-white hover-lift">
                <p className="swiss-label mb-2">Industries</p>
                <p className="text-4xl font-extrabold tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>7</p>
                <p className="text-sm text-muted-foreground mt-1">Sector-specific guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Selection */}
      <section className="border-b border-border" data-testid="industry-section">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="mb-8 fade-in">
            <p className="swiss-label mb-3">Step 01</p>
            <h2 className="text-3xl md:text-5xl tracking-tight font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Select Your Industry
            </h2>
            <p className="text-muted-foreground mt-2 text-base">
              Choose your sector for tailored recommendations and regulatory context.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-border p-6 h-32 animate-pulse bg-secondary/30" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {industries.map((ind) => {
                const Icon = INDUSTRY_ICONS[ind.id] || Building2;
                const isSelected = selectedIndustry === ind.id;
                return (
                  <button
                    key={ind.id}
                    data-testid={`industry-${ind.id}`}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`
                      border-2 p-6 text-left transition-all duration-200 group relative overflow-hidden
                      ${isSelected
                        ? "border-[#002FA7] bg-[#002FA7]/5"
                        : "border-border bg-white hover:border-foreground"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon
                        className={`w-5 h-5 ${isSelected ? "text-[#002FA7]" : "text-muted-foreground group-hover:text-foreground"}`}
                        strokeWidth={1.5}
                      />
                      {isSelected && (
                        <span className="text-xs font-mono uppercase tracking-widest text-[#002FA7]">Selected</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{ind.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ind.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {ind.regulations.slice(0, 2).map((reg) => (
                        <span key={reg} className="text-[10px] font-mono px-1.5 py-0.5 border border-border bg-secondary/50">
                          {reg}
                        </span>
                      ))}
                      {ind.regulations.length > 2 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 text-muted-foreground">
                          +{ind.regulations.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Organization Name + Start */}
      <section className="border-b border-border" data-testid="start-section">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-6 fade-in">
              <p className="swiss-label mb-3">Step 02</p>
              <h2 className="text-3xl md:text-5xl tracking-tight font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Begin Assessment
              </h2>
              <p className="text-muted-foreground text-base mb-6">
                Optionally provide your organization name for personalized reports. The assessment covers all 4 NIST AI RMF core functions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <Input
                  data-testid="org-name-input"
                  placeholder="Organization name (optional)"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-12 bg-white border-2 border-input px-4 rounded-none focus:border-[#002FA7] focus:ring-0 transition-all font-mono text-sm flex-1"
                />
                <Button
                  data-testid="start-assessment-btn"
                  onClick={handleStart}
                  disabled={!selectedIndustry}
                  className="bg-[#002FA7] text-white h-12 px-8 rounded-none font-mono uppercase tracking-widest hover:bg-[#002FA7]/90 transition-all disabled:opacity-40"
                >
                  Start <ArrowRight className="ml-2 w-4 h-4" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6 fade-in stagger-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border p-5 bg-secondary/30">
                  <p className="swiss-label mb-1">Duration</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>15-25 min</p>
                </div>
                <div className="border border-border p-5 bg-secondary/30">
                  <p className="swiss-label mb-1">Questions</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>62+</p>
                </div>
                <div className="border border-border p-5 bg-secondary/30">
                  <p className="swiss-label mb-1">Maturity Scale</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>1 - 5</p>
                </div>
                <div className="border border-border p-5 bg-secondary/30">
                  <p className="swiss-label mb-1">Output</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Report</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="dots-texture" data-testid="how-it-works">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <p className="swiss-label mb-3">Process</p>
          <h2 className="text-3xl md:text-5xl tracking-tight font-bold mb-10" style={{ fontFamily: 'Manrope, sans-serif' }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Select Industry", desc: "Choose your sector for tailored regulatory context and recommendations." },
              { step: "02", title: "Answer Questions", desc: "Rate your organization across 19 categories on a 1-5 maturity scale." },
              { step: "03", title: "View Results", desc: "Get radar charts, function scores, and overall maturity rating." },
              { step: "04", title: "Take Action", desc: "Follow prioritized action items and industry-specific guidance." },
            ].map((item, i) => (
              <div key={i} className={`border border-border bg-white p-6 group hover-lift fade-in stagger-${i + 1}`}>
                <span className="text-5xl font-extrabold text-secondary tracking-tighter block mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {item.step}
                </span>
                <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {item.title} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 md:px-8 py-8">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">NIST AI RMF Auditor</span>
          </div>
          <span className="swiss-label">Based on NIST AI 100-1 Framework</span>
        </div>
      </footer>
    </div>
  );
}
