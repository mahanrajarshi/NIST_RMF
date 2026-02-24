# NIST AI RMF Compliance Assessment Tool - PRD

## Original Problem Statement
Build a comprehensive NIST AI RMF (Artificial Intelligence Risk Management Framework) compliance assessment web-based tool for medium to large organizations. Features: questionnaire-based assessment, compliance radar chart, priority action items, and industry-specific recommendations.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Design**: Swiss-Cyber / Performance Pro aesthetic (Manrope + JetBrains Mono, sharp edges, grid textures)

## User Personas
1. **Compliance Officers** - Need comprehensive assessment across all NIST AI RMF categories
2. **CISOs/Risk Managers** - Need radar charts and maturity scoring for board reporting
3. **IT Governance Teams** - Need actionable priority items and industry guidance
4. **Audit Professionals** - Need printable reports and detailed category breakdowns

## Core Requirements (Static)
- 4 NIST AI RMF functions: Govern, Map, Measure, Manage
- 19 categories, 62 questions
- 1-5 maturity scale (Initial → Optimizing)
- 7 industries: Healthcare, Finance, Government, Defense, Tech/SaaS, Energy, Education
- No authentication required
- Static rule-based recommendations

## What's Been Implemented (Feb 24, 2026)
- [x] Landing page with industry selector and stats
- [x] Full 62-question assessment across 4 functions
- [x] Split-rail assessment layout with sidebar navigation
- [x] Progress tracking (answered/total + percentage)
- [x] Auto-scoring with maturity level calculation
- [x] Compliance radar chart (Recharts)
- [x] Function-level and category-level scores
- [x] Priority action items (gap-based, severity-ranked)
- [x] Industry-specific recommendations for 7 sectors
- [x] Category details breakdown view
- [x] Print/export support
- [x] All backend APIs (questions, industries, submit, results, recommendations)
- [x] MongoDB persistence for assessments

## Prioritized Backlog
### P0 (Done)
- Core assessment flow, scoring, results dashboard

### P1 (Next)
- Export results as PDF
- Assessment comparison (benchmark against industry averages)
- Email report delivery

### P2
- Assessment history / saved assessments view
- Custom question weighting
- Multi-user support with authentication
- Progress save/resume (partial assessment persistence)

### P3
- AI-powered remediation recommendations
- Regulatory mapping (EU AI Act, ISO 42001 crosswalk)
- Dashboard for tracking compliance over time
- API integration for automated data collection

## Next Tasks
1. PDF export functionality
2. Industry benchmarking comparison
3. Assessment progress auto-save
