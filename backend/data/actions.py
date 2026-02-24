"""
Priority action items template based on gap analysis.
Actions are generated dynamically based on assessment scores.
"""

ACTION_TEMPLATES = {
    "govern": {
        "GV.1": {
            "category_name": "AI Risk Management Policies",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Develop AI Risk Management Policy Framework",
                    "description": "Create a comprehensive AI risk management policy that defines risk tolerance, governance structure, and management procedures. Align with NIST AI RMF and applicable regulations.",
                    "timeline": "0-3 months",
                    "resources": "Policy team, Legal, CISO office",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Establish Policy Review Cycle",
                    "description": "Implement quarterly policy reviews and annual comprehensive updates. Assign policy ownership and track compliance.",
                    "timeline": "1-2 months",
                    "resources": "Governance team",
                },
            ],
        },
        "GV.2": {
            "category_name": "Accountability Structures",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Define AI Governance Roles and Responsibilities",
                    "description": "Establish a RACI matrix for AI risk management. Designate a senior leader (e.g., CAIO) and form an AI governance committee.",
                    "timeline": "0-2 months",
                    "resources": "Executive leadership, HR",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Implement Decision Documentation Process",
                    "description": "Create standardized templates and workflows for documenting AI risk decisions, including audit trails and sign-off records.",
                    "timeline": "1-3 months",
                    "resources": "IT, Compliance team",
                },
            ],
        },
        "GV.3": {
            "category_name": "Workforce Diversity & AI Literacy",
            "actions": [
                {
                    "severity": "high",
                    "threshold": 2,
                    "title": "Launch AI Risk Management Training Program",
                    "description": "Develop role-based training covering AI ethics, bias awareness, risk identification, and responsible AI principles for all relevant staff.",
                    "timeline": "1-3 months",
                    "resources": "HR, Training department, External trainers",
                },
                {
                    "severity": "medium",
                    "threshold": 3,
                    "title": "Diversify AI Teams",
                    "description": "Recruit multidisciplinary talent including ethicists, social scientists, and domain experts to complement technical AI teams.",
                    "timeline": "3-6 months",
                    "resources": "HR, Hiring managers",
                },
            ],
        },
        "GV.4": {
            "category_name": "Organizational Commitments",
            "actions": [
                {
                    "severity": "medium",
                    "threshold": 2,
                    "title": "Publish Responsible AI Principles",
                    "description": "Develop and publish organizational responsible AI principles and commitments, endorsed by senior leadership.",
                    "timeline": "1-2 months",
                    "resources": "Leadership, Communications",
                },
            ],
        },
        "GV.5": {
            "category_name": "Stakeholder Engagement",
            "actions": [
                {
                    "severity": "medium",
                    "threshold": 2,
                    "title": "Establish Stakeholder Feedback Channels",
                    "description": "Create mechanisms for external stakeholders to provide input on AI systems, including feedback portals and advisory groups.",
                    "timeline": "2-4 months",
                    "resources": "Product management, Community relations",
                },
            ],
        },
        "GV.6": {
            "category_name": "Oversight & Monitoring",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Implement AI System Audit Program",
                    "description": "Establish regular audit cycles for AI systems covering compliance, performance, bias, and security. Include both internal and third-party audits.",
                    "timeline": "1-3 months",
                    "resources": "Internal audit, External auditors",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Build AI System Registry",
                    "description": "Create and maintain a comprehensive inventory of all AI systems in use, including purpose, risk level, data sources, and responsible parties.",
                    "timeline": "1-2 months",
                    "resources": "IT, Data governance",
                },
            ],
        },
    },
    "map": {
        "MP.1": {
            "category_name": "Context & Use Case Definition",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Document AI Use Cases and Boundaries",
                    "description": "Create comprehensive documentation for each AI system including intended purpose, operational context, user profiles, and known limitations.",
                    "timeline": "0-2 months",
                    "resources": "Product teams, Data scientists",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Define Acceptable Use Criteria",
                    "description": "Establish clear criteria for acceptable and unacceptable AI use cases, including red lines that should not be crossed.",
                    "timeline": "1-2 months",
                    "resources": "Ethics committee, Legal",
                },
            ],
        },
        "MP.2": {
            "category_name": "AI System Categorization",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Implement Risk Tiering Framework",
                    "description": "Develop and apply a risk classification system (high/medium/low) for all AI systems based on potential impact to individuals and society.",
                    "timeline": "1-2 months",
                    "resources": "Risk management, AI teams",
                },
            ],
        },
        "MP.3": {
            "category_name": "Benefits & Costs Analysis",
            "actions": [
                {
                    "severity": "medium",
                    "threshold": 2,
                    "title": "Develop AI Cost-Benefit Analysis Template",
                    "description": "Create standardized templates for evaluating AI system benefits against risks, including social and environmental dimensions.",
                    "timeline": "1-2 months",
                    "resources": "Finance, Risk team",
                },
            ],
        },
        "MP.4": {
            "category_name": "Risk & Impact Identification",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Conduct Comprehensive AI Impact Assessments",
                    "description": "Perform systematic impact assessments covering bias, data quality, adversarial risks, and societal impacts for all high-risk AI systems.",
                    "timeline": "1-3 months",
                    "resources": "Data science, Legal, Ethics",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Implement AI Threat Modeling",
                    "description": "Conduct adversarial threat modeling for AI systems, including data poisoning, evasion attacks, and model manipulation scenarios.",
                    "timeline": "2-4 months",
                    "resources": "Security team, AI engineers",
                },
            ],
        },
        "MP.5": {
            "category_name": "Stakeholder Impact Assessment",
            "actions": [
                {
                    "severity": "high",
                    "threshold": 2,
                    "title": "Map and Assess Stakeholder Impacts",
                    "description": "Identify all stakeholders affected by AI systems and assess differential impacts, with special attention to vulnerable populations.",
                    "timeline": "1-3 months",
                    "resources": "Product, DEI team, Community outreach",
                },
            ],
        },
    },
    "measure": {
        "MS.1": {
            "category_name": "Metrics & Methodologies",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Define AI Trustworthiness Metrics",
                    "description": "Establish KPIs for AI trustworthiness including accuracy, robustness, fairness (demographic parity, equalized odds), and safety metrics.",
                    "timeline": "1-2 months",
                    "resources": "Data science, Quality assurance",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Establish Performance Baselines",
                    "description": "Document baseline measurements for all AI systems to enable trend analysis and drift detection.",
                    "timeline": "1-2 months",
                    "resources": "ML engineering",
                },
            ],
        },
        "MS.2": {
            "category_name": "AI System Evaluation",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Implement TEVV Program",
                    "description": "Establish formal Testing, Evaluation, Verification, and Validation processes for AI systems with documented test plans and results.",
                    "timeline": "2-4 months",
                    "resources": "QA, ML engineering, External evaluators",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Conduct Red Team Testing",
                    "description": "Implement adversarial red-teaming exercises for high-risk AI systems to test robustness and identify vulnerabilities.",
                    "timeline": "2-3 months",
                    "resources": "Security team, External red team",
                },
            ],
        },
        "MS.3": {
            "category_name": "Transparency & Explainability",
            "actions": [
                {
                    "severity": "high",
                    "threshold": 2,
                    "title": "Implement Explainability Framework",
                    "description": "Deploy explainability tools (SHAP, LIME, etc.) and create user-appropriate explanations for AI-driven decisions.",
                    "timeline": "2-4 months",
                    "resources": "ML engineering, UX team",
                },
                {
                    "severity": "medium",
                    "threshold": 3,
                    "title": "Create Transparency Documentation",
                    "description": "Develop model cards, data sheets, and transparency reports for all AI systems, tailored to different stakeholder audiences.",
                    "timeline": "1-3 months",
                    "resources": "Documentation team, Data science",
                },
            ],
        },
        "MS.4": {
            "category_name": "Documentation & Monitoring",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Deploy Continuous AI Monitoring",
                    "description": "Implement real-time monitoring dashboards for AI model performance, data drift, and anomaly detection with alerting capabilities.",
                    "timeline": "2-4 months",
                    "resources": "MLOps, Infrastructure team",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Build Drift Detection Pipeline",
                    "description": "Implement automated model drift detection with defined thresholds, alerts, and retraining triggers.",
                    "timeline": "2-3 months",
                    "resources": "ML engineering, DevOps",
                },
            ],
        },
    },
    "manage": {
        "MG.1": {
            "category_name": "Risk Prioritization",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Develop Risk Prioritization Framework",
                    "description": "Create a systematic risk prioritization methodology incorporating likelihood, impact, urgency, and regulatory exposure factors.",
                    "timeline": "1-2 months",
                    "resources": "Risk management, Leadership",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Define Risk Escalation Procedures",
                    "description": "Establish clear escalation criteria and procedures for when AI risks exceed predefined thresholds.",
                    "timeline": "1-2 months",
                    "resources": "Risk management, Executive team",
                },
            ],
        },
        "MG.2": {
            "category_name": "Risk Treatment Strategies",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Create AI Risk Treatment Plans",
                    "description": "Develop documented treatment plans for identified AI risks including specific mitigations, timelines, responsible parties, and success criteria.",
                    "timeline": "1-3 months",
                    "resources": "Risk team, AI teams, Legal",
                },
                {
                    "severity": "critical",
                    "threshold": 3,
                    "title": "Build AI Incident Response Capability",
                    "description": "Develop and test AI-specific incident response plans including detection, containment, remediation, and communication procedures.",
                    "timeline": "2-4 months",
                    "resources": "Security, Communications, Legal",
                },
            ],
        },
        "MG.3": {
            "category_name": "Third-Party Risk Management",
            "actions": [
                {
                    "severity": "high",
                    "threshold": 2,
                    "title": "Implement Third-Party AI Risk Assessment",
                    "description": "Develop vendor assessment questionnaires and due diligence processes for evaluating third-party AI components and services.",
                    "timeline": "1-3 months",
                    "resources": "Procurement, Security, Legal",
                },
                {
                    "severity": "medium",
                    "threshold": 3,
                    "title": "Establish Vendor Monitoring Program",
                    "description": "Create ongoing monitoring processes for third-party AI providers, including performance tracking and periodic reassessments.",
                    "timeline": "2-4 months",
                    "resources": "Vendor management, IT",
                },
            ],
        },
        "MG.4": {
            "category_name": "Deployment & Post-Deployment",
            "actions": [
                {
                    "severity": "critical",
                    "threshold": 2,
                    "title": "Implement AI Deployment Gate Process",
                    "description": "Create mandatory pre-deployment review checklists and approval workflows with defined go/no-go criteria for AI system launches.",
                    "timeline": "1-2 months",
                    "resources": "Product, Engineering, Risk team",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Build Human Override Capabilities",
                    "description": "Design and implement human override and intervention mechanisms for AI-driven decisions, with clear escalation paths.",
                    "timeline": "2-4 months",
                    "resources": "Engineering, Operations",
                },
            ],
        },
    },
}
