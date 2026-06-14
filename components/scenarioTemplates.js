// Premium built-in scenario templates for NAVIS Board Decision Room
export const scenarioTemplates = [
  {
    id: "scen-cyber",
    title: "Multitenant Datastore Cyber Attack",
    category: "Technology & Cyber Security",
    trigger: "External threat actor exploits a zero-day SQL injection vulnerability in our central billing microservice, exfiltrating 140,000 transaction records containing PII.",
    immediateImpact: "Immediate shutdown of API endpoints, mandatory SEBI and DPDPA regulatory disclosures, and sudden spike in customer support queries.",
    affectedObjectives: [
      "Zero-Downtime InfoSec & SOC 2 Trust Assurance",
      "IPO Readiness & Listing SEBI Alignment"
    ],
    timeline: {
      day1: {
        operational: "Primary API gateway disabled. Tech team isolates compromised database subnets. Core customer portals offline.",
        financial: "Immediate forensic audit engagement fees: ₹25 Lakhs. Customer contract SLA penalty tracking active.",
        reputation: "Leak reports surface on technology forums. Key tech journalists request official comment.",
        controls: "Database firewall failed to block database exfiltration pattern.",
        recovery: "Deploy security hot-patch, isolate database subnet, activate incident response comms."
      },
      week1: {
        operational: "Internal forensic audit complete. API services restored under strict firewall rules. Backlog of support tickets at 1,200.",
        financial: "Estimated SLA breach credits: ₹40 Lakhs. Security consultant retainer activated. Weekly SaaS billing paused.",
        reputation: "Official data breach disclosure sent to customers and SEBI. Negative press coverage in financial news.",
        controls: "Intrusion detection systems configured with outdated signature databases.",
        recovery: "Execute secure password resets, launch dedicated customer hotline."
      },
      month1: {
        operational: "Normal operations restored. Penetration testing of all customer-facing databases completed.",
        financial: "Total direct cleanup cost reaches ₹90 Lakhs. 3 critical SaaS pilots deferred. Expected ARR drop of ₹50 Lakhs.",
        reputation: "Customer churn rate spikes from 0.4% to 1.8%. PR campaign active to rebuild brand trust.",
        controls: "Third-party risk management of integrated payment gateways flagged as weak.",
        recovery: "Conduct comprehensive data privacy audits across all systems."
      },
      quarter1: {
        operational: "Security posture fully upgraded. SOC 2 Type II remediation underway. IT security team expanded.",
        financial: "Indirect revenue loss due to deferred sales: ₹2.2 Crores. Net Dollar Retention (NDR) drops from 115% to 102%.",
        reputation: "Negative articles fade. Strategic partners demand certified audit reports before renewing integrations.",
        controls: "Completed code reviews and automated vulnerability scanners integrated into deployment pipeline.",
        recovery: "Submit final insurance claim audit documents to underwriters."
      },
      year1: {
        operational: "Security operations relocated to dedicated security operations center (SOC). Full compliance with DPDPA framework.",
        financial: "Net financial drag: ₹1.5 Crores. Insurance payout offsets ₹80 Lakhs. NDR stabilized at 108%.",
        reputation: "Brand trust metrics recover to 92% of pre-breach levels. No long-term impact on contract retention.",
        controls: "Continuous log auditing and database micro-segmentation active.",
        recovery: "Establish permanent Board Security Oversight Committee."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Complete customer trust breakdown. Class-action data lawsuits filed, termination of top contracts, and indefinitely deferred IPO sequence.",
        controls: "No controls activated or updated.",
        insurance: "0% recovery (Claim denied due to gross security negligence).",
        comms: "Silent response, leading to rumors and negative PR leaks.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹5.5 Cr",
        cash: "- ₹6.2 Cr",
        ebitda: "-18%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 2
      },
      basic: {
        outcome: "Basic patch deployed. Standard security advisory issued. IPO delayed by 6 months due to compliance audits.",
        controls: "Patched database vulnerability.",
        insurance: "40% recovery of forensic costs.",
        comms: "Templated email disclosure sent after 72 hours.",
        recovery: "Sub-optimal (45% recovery)",
        revenue: "- ₹3.2 Cr",
        cash: "- ₹3.8 Cr",
        ebitda: "-10%",
        reputation: "Elevated Exposure",
        trust: "Moderate Breach",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "9 months",
        objectivesAffected: 2
      },
      strong: {
        outcome: "Immediate sub-net isolation, emergency system patching, and transparent public disclosure. IPO schedule preserved.",
        controls: "Database subnets micro-segmented, intrusion detection signatures updated.",
        insurance: "80% coverage of incident response and business interruption costs.",
        comms: "Transparent public statement within 12 hours from CEO.",
        recovery: "Highly Effective (85% recovery)",
        revenue: "- ₹1.5 Cr",
        cash: "- ₹1.8 Cr",
        ebitda: "-5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 1
      },
      aggressive: {
        outcome: "Full deployment of premium cyber response team, immediate failover to backup datastores, and legal blocks against malicious actors.",
        controls: "Automated container failover to isolated subnets, zero-trust gateway policies.",
        insurance: "95% total recovery of costs.",
        comms: "Executive-led customer briefing and live status portal.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹60 L",
        cash: "- ₹80 L",
        ebitda: "-2%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1 month",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Has the forensic audit confirmed the exact scope of PII exfiltrated?",
        "Why did the database intrusion prevention controls fail to alert tech teams?",
        "What is the liability exposure under our current enterprise customer SLA clauses?"
      ],
      decisions: [
        "Authorize emergency allocation of ₹1.5 Cr for security operations center (SOC) deployment.",
        "Approve public communication strategy and customer notification sequence."
      ],
      committees: ["Risk Committee", "Audit Committee", "Technology Committee"],
      escalations: ["SEBI Prospectus Amendment required", "DPDPA Data Protection Board notification within 72 hours"],
      immediateActions: [
        "Engage external legal counsel specialising in data privacy regulations.",
        "Initiate cyber insurance claim process."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Failing to act leads to cascading system hacks, massive customer churn, and severe regulatory fines under DPDPA.",
        expected: "Immediate exfiltration of customer database backups leading to ₹5.5 Cr in ARR loss.",
        worst: "Complete collapse of customer trust, forcing the company to cease operations in the US region.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "The board must prepare for existential regulatory audits and potential class-action litigation."
      },
      basic: {
        summary: "A standard system patch restores operations but does not resolve regulatory and reputational exposures.",
        expected: "API restored within 48 hours. Sales pipeline slows down, resulting in ₹3.2 Cr revenue loss.",
        worst: "Two large enterprise customers terminate contract agreements due to audit failures.",
        recovery: "Estimated recovery duration: 9 months.",
        boardNote: "Ongoing monitoring of customer contract renewals is highly recommended."
      },
      strong: {
        summary: "Rapid patching, forensic transparency, and proactive customer outreach successfully contain the impact.",
        expected: "API operations back online in 12 hours. SLA penalties contained at ₹40 Lakhs. Net ARR drag of ₹1.5 Cr.",
        worst: "Breach leads to ₹2.5 Cr ARR loss if PR communications are mismanaged.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "Proactive compliance updates have successfully satisfied SEBI IPO regulators."
      },
      aggressive: {
        summary: "Zero-trust isolation, automated backup datastore failovers, and immediate client briefs preserve corporate posture.",
        expected: "API services back online in 4 hours. No data exfiltration from primary accounts. Net revenue drag under ₹60 Lakhs.",
        worst: "Customer churn limited to small startups, impact restricted to ₹1.2 Cr in worst case.",
        recovery: "Estimated recovery duration: 1 month.",
        boardNote: "Management response represents best-in-class incident management standards."
      },
      executiveBrief: {
        ceoMemo: "Board Members,\n\nWe are facing a critical cyber incident impacting 140,000 customer records. I have authorized immediate subnet isolation and deployed our retained forensic team. While direct SLA penalties are capped, the real threat is to our pre-IPO Net Dollar Retention (NDR). We must demonstrate absolute transparency to prevent enterprise client churn. I recommend we proactively waive next month's SaaS fees for impacted cohorts.",
        legalCounsel: "Under the new DPDPA framework, we have exactly 72 hours to formally notify the Data Protection Board. Failure to do so will result in statutory penalties scaling up to ₹250 Crores. Furthermore, our enterprise contracts require disclosure to their vendor risk teams within 48 hours. Any delay constitutes a material breach of contract, allowing them to terminate without penalty."
      }
    }
  },
  {
    id: "scen-churn",
    title: "Major Customer Churn",
    category: "Commercial & Growth",
    trigger: "Our top 3 enterprise contract accounts representing 48% of ARR decline to renew due to product delivery delays and aggressive competitor pricing.",
    immediateImpact: "Sudden drop in monthly recurring revenue, compression of cash runway from 18 months to 8 months, and potential valuation write-down.",
    affectedObjectives: [
      "500 Cr ARR Revenue Milestones Expansion",
      "Enterprise Customer Churn Prevention (<0.5%)"
    ],
    timeline: {
      day1: {
        operational: "Sales team receives non-renewal notice from top 2 customers. High-priority account team meetings scheduled.",
        financial: "Immediate ARR reduction of ₹4 Crores. Cash flow projections updated with negative trends.",
        reputation: "Competitor sales reps start targeting our remaining enterprise accounts.",
        controls: "Customer health scoring model failed to flag early integration drops.",
        recovery: "Initiate emergency customer success executive call, freeze non-essential headcount hiring."
      },
      week1: {
        operational: "Detailed account review reveals integration issues and feature request backlog were main causes.",
        financial: "Arranged credit line extension talks with current bankers. Cash burn calculations adjusted.",
        reputation: "Competitors publish case studies targeting our industry segment.",
        controls: "Customer relationship tracking tools lacked direct product telemetry.",
        recovery: "Execute executive-level product roadmap review, establish churn-response taskforce."
      },
      month1: {
        operational: "New custom feature patches deployed to salvage 3rd customer account. Key customer success leadership replaced.",
        financial: "ARR drop reflected in quarterly board pack. Cash runways stabilize at 9 months.",
        reputation: "Public industry reports flag pricing pressure in our SaaS sector.",
        controls: "Service level agreements (SLAs) updated to guarantee custom features timelines.",
        recovery: "Deploy dedicated product specialists to top 5 remaining client accounts."
      },
      quarter1: {
        operational: "New enterprise customer onboarding speed increased. Sales pipeline reviews doubled.",
        financial: "Indirect revenue loss due to sales velocity slow down: ₹1.8 Crores. Operational margins compressed.",
        reputation: "Company redirects PR to emphasize customer satisfaction metrics and product stability.",
        controls: "Account health scoring now integrated directly with server telemetry.",
        recovery: "Present comprehensive ARR remediation and customer retention plan to the Board."
      },
      year1: {
        operational: "Enterprise customer base diversified. Churn rate drops to 0.4% baseline. Product delivery velocity normalized.",
        financial: "Net ARR recovery of ₹2.5 Crores. Cash runways restored to 16 months.",
        reputation: "Regained dominant market share positioning in main target sectors.",
        controls: "Continuous telemetry monitoring and monthly customer satisfaction audits active.",
        recovery: "Conduct independent review of enterprise product release cycles."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Severe corporate margins compression, massive valuation cuts in VC meetings, and cash flows breach within 6 months.",
        controls: "No customer health controls updated.",
        insurance: "0% recovery (Commercial customer churn is not covered by insurance policies).",
        comms: "No client communications, leading to rumors and staff panic.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹8.0 Cr",
        cash: "- ₹9.2 Cr",
        ebitda: "-25%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 2
      },
      basic: {
        outcome: "Standard pricing discount offered. Salvages 1 out of 3 customers. ARR drop leads to 12 months delay in IPO.",
        controls: "Offered standard contract discounts.",
        insurance: "0% recovery.",
        comms: "Standard account executive negotiation emails.",
        recovery: "Sub-optimal (30% recovery)",
        revenue: "- ₹4.5 Cr",
        cash: "- ₹5.2 Cr",
        ebitda: "-14%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "12 months",
        objectivesAffected: 2
      },
      strong: {
        outcome: "Executive product roadmap guarantees, direct founder intervention, and custom product patches. Salvages 2 out of 3 accounts.",
        controls: "Custom roadmap delivery guarantees, dedicated product engineers assigned.",
        insurance: "0% recovery.",
        comms: "CEO and Founders meet directly with customer stakeholders.",
        recovery: "Highly Effective (75% recovery)",
        revenue: "- ₹1.8 Cr",
        cash: "- ₹2.2 Cr",
        ebitda: "-6%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "6 months",
        objectivesAffected: 1
      },
      aggressive: {
        outcome: "Immediate acquisitions of competitor features, contract renegotiations with price matching, and dedicated success teams.",
        controls: "Full price matching templates, product integration priority support.",
        insurance: "0% recovery.",
        comms: "Dedicated executive briefing sessions and on-site support deployment.",
        recovery: "Optimized (90% recovery)",
        revenue: "- ₹70 L",
        cash: "- ₹90 L",
        ebitda: "-2.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "2 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "What specific product delivery delays caused the primary customer frustration?",
        "How is our enterprise pipeline diversified to reduce single-client dependency?",
        "Are our sales incentives aligned to reward customer retention rather than just new bookings?"
      ],
      decisions: [
        "Approve revised annual operating budget reflecting 20% margin compressions.",
        "Authorize capital expenditure for custom features engineering hiring."
      ],
      committees: ["Risk Committee", "Finance Committee", "Commercial Committee"],
      escalations: ["Debt covenants renegotiations required", "Board budget restructuring approvals"],
      immediateActions: [
        "Direct CEO to initiate face-to-face retention meetings with remaining top 5 customers.",
        "Freeze hiring for all non-engineering roles."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Failing to act leads to cascading client losses, severe cash flow crunch, and eventual business restructuring.",
        expected: "Decline of all top 3 enterprise contracts resulting in ₹8.0 Cr ARR drop.",
        worst: "Covenants breach in bank loans, leading to immediate debt recall and potential liquidation.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "The board must prepare for emergency cash infusions or debt restructuring."
      },
      basic: {
        summary: "Standard contract discounts salvage some revenue but compress overall SaaS profit margins.",
        expected: "Salvaging 1 account contains loss to ₹4.5 Cr. Burn rate remains elevated.",
        worst: "Staff layoffs required in sales division due to budget shortfalls.",
        recovery: "Estimated recovery duration: 12 months.",
        boardNote: "Active monitoring of engineering team turnover is recommended during resource reallocations."
      },
      strong: {
        summary: "Executive alignment, product guarantees, and dedicated engineering contain the churn impact.",
        expected: "Salvaging 2 accounts contains ARR drop to ₹1.8 Cr. Cash runway stabilized at 14 months.",
        worst: "Competitive pressures defer sales pipeline expansion by 6 months.",
        recovery: "Estimated recovery duration: 6 months.",
        boardNote: "Board approves product delivery deadlines tracking dashboards."
      },
      aggressive: {
        summary: "Aggressive price matching and competitor features deployment minimize ARR loss entirely.",
        expected: "All top accounts retained under revised pricing schedules, ARR drag limited to ₹70 Lakhs.",
        worst: "EBITDA margins drop by 3% in worst-case scenario.",
        recovery: "Estimated recovery duration: 2 months.",
        boardNote: "Management has successfully protected market share positioning under heavy competition."
      }
    }
  },
  {
    id: "scen-exec",
    title: "Key Executive Resignation",
    category: "People & Governance",
    trigger: "Sudden joint resignation of the Chief Revenue Officer (CRO) and VP of Engineering to join a competitor, 4 months prior to planned IPO filing.",
    immediateImpact: "Interruption in enterprise sales deals, drop in engineering team morale, and negative signals to IPO underwriters and institutional book runners.",
    affectedObjectives: [
      "IPO Readiness & Listing SEBI Alignment",
      "500 Cr ARR Revenue Milestones Expansion"
    ],
    timeline: {
      day1: {
        operational: "Executive resignations received. HR team schedules exit interviews. Project roadmaps reviewed.",
        financial: "IPO underwriting discussions placed on standby. Executive search fees: ₹15 Lakhs.",
        reputation: "Industry rumors start circulating regarding leadership conflicts.",
        controls: "Key-person retention planning and succession policy failed.",
        recovery: "Publish internal reassurance notice, appoint interim leaders immediately."
      },
      week1: {
        operational: "Interim CRO and VP Engineering appointed from internal leadership. Key client success teams briefed.",
        financial: "Arranged retention bonus pool of ₹50 Lakhs for senior engineering leads.",
        reputation: "Competitors actively target our engineering staff for recruitment.",
        controls: "Non-compete clauses in executive employment agreements reviewed.",
        recovery: "Launch executive search with top-tier recruitment agency, hold employee town halls."
      },
      month1: {
        operational: "Interim leadership stabilizes engineering sprints. Executive search produces first interviews.",
        financial: "Sales pipeline velocity drops by 15% due to transitional adjustments.",
        reputation: "PR releases announce new product integrations to counter negative rumors.",
        controls: "Access controls revoked for outgoing executives, security audits complete.",
        recovery: "Execute retention agreement contracts with remaining key leadership members."
      },
      quarter1: {
        operational: "New VP of Engineering onboarded. Engineering roadmaps synchronized.",
        financial: "Total transitional recruitment and retention costs reach ₹85 Lakhs. IPO timelines deferred by 3 months.",
        reputation: "IPO book runners confirm neutral market sentiment following new hire announcement.",
        controls: "Succession plans and critical knowledge bases updated.",
        recovery: "Present new executive onboarding and product delivery status to the Board."
      },
      year1: {
        operational: "New leadership team fully integrated. Enterprise sales velocity hits record levels.",
        financial: "Net executive replacement drag: ₹60 Lakhs. IPO successfully completed.",
        reputation: "Industry reviews praise transition management and company resilience.",
        controls: "Standardized succession frameworks and talent retention policies active.",
        recovery: "Review annual executive compensation and equity incentive structures."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Engineering team attrition spikes, critical product releases delayed by 6 months, and underwriters withdraw from IPO prospectus.",
        controls: "No key-person retention plans updated.",
        insurance: "0% recovery (Executive resignations are not covered by insurance).",
        comms: "Silent response, leading to employee panic and public rumors.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹3.5 Cr",
        cash: "- ₹4.2 Cr",
        ebitda: "-10%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 2
      },
      basic: {
        outcome: "Interim leadership appointed. Standard search launched. Sales pipeline slows down, resulting in ₹2.0 Cr revenue drag.",
        controls: "Appointed interim leadership.",
        insurance: "0% recovery.",
        comms: "Standard internal employee notice email.",
        recovery: "Sub-optimal (40% recovery)",
        revenue: "- ₹2.0 Cr",
        cash: "- ₹2.5 Cr",
        ebitda: "-6%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "8 months",
        objectivesAffected: 2
      },
      strong: {
        outcome: "Emergency retention bonus pool, immediate appointment of internal leaders, and top-tier search agency engaged. IPO delayed by only 3 months.",
        controls: "Retention bonuses executed, non-compete agreements enforced.",
        insurance: "0% recovery.",
        comms: "Founders address staff in live town hall, transparent updates to lead book runners.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹90 L",
        cash: "- ₹1.2 Cr",
        ebitda: "-3%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 1
      },
      aggressive: {
        outcome: "Immediate talent buyouts, doubling equity retention pools for engineering leads, and founder-led sales pipeline management.",
        controls: "Doubled equity retention pools, founder-led sales briefings.",
        insurance: "0% recovery.",
        comms: "Direct client video briefings, comprehensive PR transition campaign.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹30 L",
        cash: "- ₹40 L",
        ebitda: "-1%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1.5 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "What key grievances or competing offers triggered the joint resignations?",
        "Are our current intellectual property access controls secure against outgoing personnel?",
        "How will interim leadership bridge client relationship gaps to prevent sales churn?"
      ],
      decisions: [
        "Approve emergency retention pool budget allocation of ₹50 Lakhs.",
        "Authorize revised timeline for SEBI IPO filing sequence."
      ],
      committees: ["Nomination & Remuneration Committee", "Risk Committee"],
      escalations: ["IPO prospectus amendment approvals", "Executive compensation reviews"],
      immediateActions: [
        "Engage top-tier recruitment firm for global executive search.",
        "Confirm all IP and code repository write access is revoked for outgoing team members."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Failing to act leads to cascading staff departures, engineering delays, and complete derailment of the IPO sequence.",
        expected: "Decline in sales velocity and product delivery failures resulting in ₹3.5 Cr revenue loss.",
        worst: "Key customer pilots fail, resulting in brand damage and termination of sales licenses.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Immediate founder intervention is required to stabilize engineering morale."
      },
      basic: {
        summary: "Standard recruitment processes restore leadership but fail to contain operational delays.",
        expected: "Transitional gaps result in ₹2.0 Cr revenue loss. Product releases delayed by 4 months.",
        worst: "Departure of 2 additional senior engineers to the same competitor.",
        recovery: "Estimated recovery duration: 8 months.",
        boardNote: "Hiring velocities should be monitored closely during transition."
      },
      strong: {
        summary: "Emergency retention incentives and active founder leadership contain the attrition threat.",
        expected: "Interim leadership stabilizes sprints. Sales pipeline losses contained at ₹90 Lakhs.",
        worst: "IPO delayed by 6 months in worst-case scenario.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "Retention bonus pool successfully stabilized the core engineering staff."
      },
      aggressive: {
        summary: "Founder-led operations and premium talent buyouts minimize transitional revenue impacts entirely.",
        expected: "New hires onboarded in record time, ARR drag limited to ₹30 Lakhs with zero additional staff turnover.",
        worst: "Transitional recruitment costs exceed budget by 20%.",
        recovery: "Estimated recovery duration: 1.5 months.",
        boardNote: "Management transition execution was exemplary under difficult circumstances."
      }
    }
  },
  {
    id: "scen-cloud",
    title: "Cloud Provider Outage",
    category: "Technology & Cyber Security",
    trigger: "Our primary cloud infrastructure region suffers a catastrophic hardware and DNS failure, rendering all multitenant databases completely inaccessible for 36 contiguous hours.",
    immediateImpact: "Complete SaaS service blackout for 240+ enterprise customers, active SLA penalty triggers, and heavy volume of customer support escalation.",
    affectedObjectives: [
      "Zero-Downtime InfoSec & SOC 2 Trust Assurance"
    ],
    timeline: {
      day1: {
        operational: "Primary server clusters offline. DNS resolution failing. Secondary hot-standby replication synchronization stalled.",
        financial: "Immediate SLA penalty tracking active. Incident response operations cost: ₹10 Lakhs.",
        reputation: "System status page crashes under load. Severe customer complaints on business forums.",
        controls: "Cross-region automatic failover fail due to DNS registry routing locks.",
        recovery: "Initiate manual database restore sequences from cold backups in alternative region."
      },
      week1: {
        operational: "Main operations restored on secondary cloud platform. Forensic analysis indicates severe storage system degradation.",
        financial: "SLA credit liabilities calculated at ₹85 Lakhs. Database restoration consultant billing: ₹15 Lakhs.",
        reputation: "Apology letters sent by CEO. Public post-mortem published.",
        controls: "Backup validation frequency was monthly instead of daily checkouts.",
        recovery: "Establish redundant DNS cluster routing systems with dynamic latency routing."
      },
      month1: {
        operational: "Core infrastructure migrated back to primary host under strict reliability testing protocols.",
        financial: "Direct service credit payouts of ₹90 Lakhs. 2 major enterprise contract negotiations stalled.",
        reputation: "Customer satisfaction score drops to historical low. Industry competitors run reliability ad campaigns.",
        controls: "Multi-cloud hosting architectures identified as key long-term operational requirement.",
        recovery: "Initiate pilot program for secondary standby provider integration."
      },
      quarter1: {
        operational: "SOC 2 review panel inspects recovery logs. Zero-downtime objective status downgraded to 'Critical Risk'.",
        financial: "Total direct and indirect financial shock calculated at ₹1.8 Crores. Cyber and business interruption insurance claim submitted.",
        reputation: "Customer churn stabilized. 95% of accounts accept credit notes instead of termination.",
        controls: "Multi-region DNS failover controls verified and fully automated.",
        recovery: "Deploy automated failover testing drills during off-peak hours."
      },
      year1: {
        operational: "Full active-active multi-cloud infrastructure deployment complete. Core uptime reaches 99.99%.",
        financial: "Net financial drag: ₹1.2 Crores (after ₹60 Lakhs insurance recovery payout).",
        reputation: "Uptime performance restores enterprise brand credibility to pre-outage benchmarks.",
        controls: "Continuous multi-cloud network telemetry auditing active.",
        recovery: "Establish annual disaster recovery drill as mandatory board-level review gate."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Permanent database corruption on primary clusters. Extended 5-day outage, massive client contract terminations, and legal claims.",
        controls: "No disaster recovery modifications.",
        insurance: "0% recovery (Claim denied due to failure to maintain updated offline backup archives).",
        comms: "Radio silence from leadership, creating maximum panic.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹6.0 Cr",
        cash: "- ₹7.5 Cr",
        ebitda: "-20%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Manual failover executed after 36 hours. Basic database integrity restored. Standard SLA penalty payout.",
        controls: "Standard database backup files restored manually.",
        insurance: "35% cost recovery.",
        comms: "Delayed static email notifications to administrators.",
        recovery: "Sub-optimal (50% recovery)",
        revenue: "- ₹3.5 Cr",
        cash: "- ₹4.2 Cr",
        ebitda: "-11%",
        reputation: "Elevated Exposure",
        trust: "Moderate Breach",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "6 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Rapid migration of key workloads to secondary host within 8 hours. Active communications minimize legal liability.",
        controls: "Automated backup restoration, DNS hot-standby switch active.",
        insurance: "75% cost coverage for business interruption.",
        comms: "Hourly transparent updates via status page and customer portal.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹1.2 Cr",
        cash: "- ₹1.5 Cr",
        ebitda: "-4%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "2 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Automated active-active multi-cloud routing prevents service disruption. Zero customer-facing downtime. Impact negligible.",
        controls: "Active-active load balancer clusters, automated failover.",
        insurance: "90% recovery of operational transition costs.",
        comms: "Real-time automated status dashboard notifications and direct executive briefings.",
        recovery: "Optimized (98% recovery)",
        revenue: "- ₹20 L",
        cash: "- ₹30 L",
        ebitda: "-0.8%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1 week",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why did the secondary automated database replication fail during the primary regional blackout?",
        "What are the precise legal liabilities under our enterprise SLA customer agreements?",
        "What capital budget is required to deploy a true active-active multi-cloud infrastructure?"
      ],
      decisions: [
        "Approve ₹80 Lakhs CAPEX allocation for secondary cloud provider infrastructure integration.",
        "Authorize corporate communication response and customer credit note allocations."
      ],
      committees: ["Risk Committee", "Technology Committee"],
      escalations: ["Enterprise SLA breach threshold warnings", "Public press statements approval"],
      immediateActions: [
        "Direct the engineering leadership to present multi-region failover audit within 7 days.",
        "Engage external reliability engineers to audit storage architecture."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting disaster recovery engineering turns a temporary outage into a business-ending reputation event.",
        expected: "5-day complete system blackout, causing massive customer contract cancellations of ₹6.0 Cr ARR.",
        worst: "Irretrievable database data loss leading to regulatory license cancellations and developer team exit.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Immediate risk of major contract litigation and insolvency procedures."
      },
      basic: {
        summary: "Manual recovery processes eventually restore services but fail to protect enterprise client trust.",
        expected: "Outage resolves after 36 hours. Standard SLA payouts drag cash by ₹4.2 Cr.",
        worst: "Security post-mortem reveals data sync inconsistencies, requiring manual patch scripts.",
        recovery: "Estimated recovery duration: 6 months.",
        boardNote: "Continuous monitoring of customer NPS scores is required to assess renewal risk."
      },
      strong: {
        summary: "Proactive disaster recovery plans and rapid backup deployments contain the financial and reputation damage.",
        expected: "Services fully online on secondary server in 8 hours. SLA payouts capped at ₹85 Lakhs.",
        worst: "Competitors capitalize on the event, delaying new enterprise sales by 3 months.",
        recovery: "Estimated recovery duration: 2 months.",
        boardNote: "Board approves the acceleration of the multi-cloud active-active architecture roadmap."
      },
      aggressive: {
        summary: "Active-active multi-cloud architectures dynamically absorb regional provider failures with zero downtime.",
        expected: "Load balances seamlessly route client traffic, limiting revenue impact to minor transition costs.",
        worst: "Slight database query latency for European customers during failover window.",
        recovery: "Estimated recovery duration: 1 week.",
        boardNote: "Management's architectural redundancy decisions have successfully protected company value."
      }
    }
  },
  {
    id: "scen-dpdp",
    title: "DPDP Consent Penalty",
    category: "Legal & Regulatory Compliance",
    trigger: "Data Protection Board of India issues a show-cause notice regarding non-compliant user consent architectures in our mobile application, violating Section 6 of the DPDP Act.",
    immediateImpact: "Potential maximum statutory penalty exposure of up to ₹250 Crores, threat of service suspend orders, and immediate audit by regulatory officers.",
    affectedObjectives: [
      "IPO Readiness & Listing SEBI Alignment"
    ],
    timeline: {
      day1: {
        operational: "Notice received from Data Protection Board. Internal compliance teams begin scanning database log architectures.",
        financial: "Legal retainer fee activated: ₹15 Lakhs. Strategic VC funding discussions placed on standby.",
        reputation: "Regulatory notice details leak to technology news portals. Corporate trust indexes decline.",
        controls: "User consent checkbox system defaulted to 'Checked', directly breaching DPDP consent rules.",
        recovery: "Deploy emergency mobile app update removing defaulted consent checks."
      },
      week1: {
        operational: "Comprehensive compliance log audit completed. 85,000 active accounts identified with defaulted consent histories.",
        financial: "Estimated defense cost budget allocated: ₹45 Lakhs. Penalty modeling ranges calculated.",
        reputation: "Official advisory issued to partners detailing compliance remediation plans.",
        controls: "Legal sign-off process bypassed during rapid frontend code deploy cycles.",
        recovery: "Submit official initial response to Data Protection Board outlining immediate patch actions."
      },
      month1: {
        operational: "New double-opt-in consent flows deployed across all platforms. Independent regulatory auditor engaged.",
        financial: "Total legal advisory bill reaches ₹80 Lakhs. SaaS sales velocity in BFSI segment drops by 20%.",
        reputation: "Brand sentiment metrics recover following transparent user privacy updates.",
        controls: "Privacy-by-design frameworks integrated into engineering release checklists.",
        recovery: "Conduct live training sessions on DPDP compliance for all product teams."
      },
      quarter1: {
        operational: "Regulatory audit report confirms compliance. Data Protection Board holds final hearing on penalty.",
        financial: "Statutory penalty settled at ₹1.5 Crores. Indirect IPO delay cost estimated at ₹1.2 Crores.",
        reputation: "IPO prospectus updated with warning disclosures. Listing approvals rescheduled.",
        controls: "Compliance logging automated and made available in admin dashboards.",
        recovery: "Complete final compliance documentation submission to the Board."
      },
      year1: {
        operational: "Dedicated Data Protection Officer (DPO) onboarded. Compliance architectures certified as 'DPDP Complete'.",
        financial: "Net financial impact: ₹2.8 Crores (settlement + legal fees + delayed IPO overhead).",
        reputation: "Regained certified supplier status with BFSI clients. Trust score restored.",
        controls: "Continuous consent logging audits active. Quarterly independent compliance reviews.",
        recovery: "Incorporate compliance scorecard indicators into monthly executive reports."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Data Protection Board imposes maximum penalty of ₹50 Crores for gross compliance neglect, ordering immediate service suspension.",
        controls: "Consent systems left unchanged.",
        insurance: "0% recovery (Regulatory fines are not covered by standard liability insurance policies).",
        comms: "Failure to respond, leading to public show-cause details and news panic.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹15.0 Cr",
        cash: "- ₹18.0 Cr",
        ebitda: "-35%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Emergency consent checkbox update deployed. Penalty settled at ₹5 Crores. IPO delayed by 12 months.",
        controls: "Checkbox defaulted consent flow corrected.",
        insurance: "0% recovery.",
        comms: "Standard static compliance statement published on website.",
        recovery: "Sub-optimal (40% recovery)",
        revenue: "- ₹6.0 Cr",
        cash: "- ₹7.5 Cr",
        ebitda: "-15%",
        reputation: "Elevated Exposure",
        trust: "Moderate Breach",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "12 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Double opt-in architecture deployed. Prompt responses contain penalty at ₹1.5 Crores. IPO schedule delayed by only 3 months.",
        controls: "Double opt-in consent flow deployed, compliance logging automated.",
        insurance: "0% recovery.",
        comms: "CEO-led transparent user update and compliance commitment webinar.",
        recovery: "Highly Effective (85% recovery)",
        revenue: "- ₹2.2 Cr",
        cash: "- ₹2.8 Cr",
        ebitda: "-6%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Complete privacy architecture redesign, proactive audit filing, and direct settlement negotiations. Penalty capped at ₹30 Lakhs.",
        controls: "Zero-trust user privacy database, real-time consent revoking portal.",
        insurance: "0% recovery.",
        comms: "Direct enterprise customer briefing portal and certified audit disclosures.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹80 L",
        cash: "- ₹1.1 Cr",
        ebitda: "-2.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1.5 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why was the non-compliant checkbox consent layout approved without legal audit?",
        "Are our other consumer-facing application platforms fully compliant with DPDP Section 6?",
        "What is the impact of a SEBI prospectus amendment on our current IPO target timelines?"
      ],
      decisions: [
        "Approve allocation of ₹80 Lakhs for specialized legal counsel and DPO hiring.",
        "Authorize revised IPO listing timelines and SEBI disclosure filings."
      ],
      committees: ["Audit Committee", "Risk Committee", "Nomination & Remuneration Committee"],
      escalations: ["DPDPA regulatory penalty threshold warnings", "IPO filing postponement approvals"],
      immediateActions: [
        "Engage premium Delhi-based regulatory legal counsel.",
        "Direct product team to execute a compliance sweep of all user interfaces."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting regulatory consent warnings results in maximum financial penalties and potential operations shutdown.",
        expected: "Statutory fine of ₹50 Crores, causing complete depletion of cash reserves and business closure.",
        worst: "Data Protection Board orders absolute suspension of SaaS platform hosting.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "The board must consider restructuring or seeking immediate capital infusion."
      },
      basic: {
        summary: "Standard compliance updates satisfy the warning but fail to contain significant statutory penalties.",
        expected: "Checkbox corrected, fine settled at ₹5 Crores. Cash reserves drop to critical warning limits.",
        worst: "BFSI segment clients cancel contracts due to compliance failure notifications.",
        recovery: "Estimated recovery duration: 12 months.",
        boardNote: "Ongoing legal defense budget monitoring is recommended."
      },
      strong: {
        summary: "Transparent compliance engagement and double-opt-in deployments successfully contain legal exposure.",
        expected: "Fine capped at ₹1.5 Crores. IPO prospectus successfully updated and approved by SEBI.",
        worst: "Transition delays new customer pipelines in regulated sectors by 4 months.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "Management's quick containment actions are supported by book runners."
      },
      aggressive: {
        summary: "Proactive privacy portal deployments and immediate regulatory settlements minimize DPDP exposures.",
        expected: "Fines capped at ₹30 Lakhs. Company positions privacy architecture as a core sales advantage.",
        worst: "Product release timeline delayed by 3 weeks to deploy consent log database.",
        recovery: "Estimated recovery duration: 1.5 months.",
        boardNote: "Regulatory compliance certified as complete, removing all IPO listing hurdles."
      }
    }
  },
  {
    id: "scen-fund",
    title: "Fundraising Failure",
    category: "Financial & Liquidity",
    trigger: "Lead term-sheet investor pulls out of our planned ₹120 Crore Series C funding round at the final closure stage, citing macro valuation compression and high cash burn.",
    immediateImpact: "Immediate drop in cash runway to 4 months, freeze on strategic expansion programs, and threat of valuation down-round.",
    affectedObjectives: [
      "500 Cr ARR Revenue Milestones Expansion",
      "IPO Readiness & Listing SEBI Alignment"
    ],
    timeline: {
      day1: {
        operational: "Notice of term sheet cancellation received. CEO freezes all non-essential operational expenditure.",
        financial: "Strategic cash flow modeling updated. Current cash runway: 120 days.",
        reputation: "Rumors of funding failure circulate among venture capital networks.",
        controls: "Capital runway warnings failed to trigger budget cuts earlier in the fiscal year.",
        recovery: "Activate contingency discussions with existing major VC board backers."
      },
      week1: {
        operational: "Detailed cost restructuring plan drafted. Non-essential hiring frozen globally.",
        financial: "Arranged meetings with debt providers for emergency venture debt lines.",
        reputation: "Internal team briefings held to stabilize key executive retention.",
        controls: "Single-investor dependency in funding pipeline identified as core vulnerability.",
        recovery: "Submit secondary term-sheet pitches to fallback VC investor pipeline."
      },
      month1: {
        operational: "Cost reduction plans executed. Operational cash burn compressed by 25%.",
        financial: "Venture debt line of ₹20 Crores approved under high interest rates. Cash runway extended to 7 months.",
        reputation: "Competitors target our sales leads using funding uncertainty narratives.",
        controls: "Burn rate targets updated to mandate 9 months cash buffer at all times.",
        recovery: "Execute bridge-round negotiations with current board investors."
      },
      quarter1: {
        operational: "Engineering roadmaps restructured. Non-revenue generating product pilots deferred.",
        financial: "Bridge round of ₹40 Crores closed with existing investors at flat valuation. Runway stabilized at 12 months.",
        reputation: "PR announcements focus on path-to-profitability milestone achievements.",
        controls: "Board approval guidelines updated to require pre-backed term sheets.",
        recovery: "Complete transition to profitability focus over rapid headcount growth."
      },
      year1: {
        operational: "Corporate operations achieve EBITDA break-even status. Self-sustaining cash flow models active.",
        financial: "Cash runways restored to 18 months without dilution. IPO targets deferred by 9 months.",
        reputation: "Underwriters praise transition to profitability, confirming strong institutional interest.",
        controls: "Monthly cash burn audits directly managed by Board Finance Committee.",
        recovery: "Resume standard growth operations under strict capital efficiency guidelines."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Corporate insolvency within 4 months. Emergency distress asset sale required to settle creditor liabilities.",
        controls: "No operational expenditure cuts.",
        insurance: "0% recovery (Funding failure is not covered by insurance).",
        comms: "Radio silence leading to massive staff panic and vendor payment freezes.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹12.0 Cr",
        cash: "- ₹14.5 Cr",
        ebitda: "-30%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 2
      },
      basic: {
        outcome: "Hiring freeze executed. Venture debt closed at high costs. Runway extended to 6 months. IPO delayed by 18 months.",
        controls: "Headcount hiring frozen.",
        insurance: "0% recovery.",
        comms: "Standard internal leadership status emails.",
        recovery: "Sub-optimal (45% recovery)",
        revenue: "- ₹6.5 Cr",
        cash: "- ₹8.0 Cr",
        ebitda: "-16%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "18 months",
        objectivesAffected: 2
      },
      strong: {
        outcome: "Bridge round of ₹40 Crores closed, burn rate cut by 25%. Runway stabilized at 12 months. Flat-round valuation.",
        controls: "Operational burn compressed, bridge financing executed.",
        insurance: "0% recovery.",
        comms: "Coordinated VC syndicate messaging and founder-led internal briefings.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹2.8 Cr",
        cash: "- ₹3.5 Cr",
        ebitda: "-7%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "9 months",
        objectivesAffected: 1
      },
      aggressive: {
        outcome: "Proactive transition to EBITDA break-even within 90 days. Zero-burn operational structures. Valuation protected.",
        controls: "EBITDA break-even target model activated, venture debt line secured.",
        insurance: "0% recovery.",
        comms: "Public announcements emphasizing corporate self-sustainability and strong cash generation.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹1.1 Cr",
        cash: "- ₹1.5 Cr",
        ebitda: "-3%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "4 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why was the term sheet closure delayed until the cash runway reached critical levels?",
        "What specific operational divisions contribute to our current high cash burn rates?",
        "What venture debt options are available without triggering restrictive covenant locks?"
      ],
      decisions: [
        "Approve immediate bridge round capital raising authorization of ₹40 Crores.",
        "Authorize 20% budget reductions across marketing and non-engineering divisions."
      ],
      committees: ["Finance Committee", "Risk Committee"],
      escalations: ["Cash runway warning threshold breaches", "Venture debt covenant approvals"],
      immediateActions: [
        "Engage investment banking advisors to source alternative capital pools.",
        "Appoint a restructuring advisor to optimize operational spend profiles."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting burn rates during a funding freeze results in insolvency and business closure within 120 days.",
        expected: "Cash depletion leads to salary freezes and cessation of SaaS hosting systems.",
        worst: "Involuntary bankruptcy proceedings initiated by primary office landlords and vendors.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Immediate capital infusion of at least ₹15 Crores is required to sustain basic operations."
      },
      basic: {
        summary: "Basic hiring freezes extend runway slightly but do not resolve core cash burn issues.",
        expected: "Runway extended by 45 days. Delayed vendor payments trigger service warning notices.",
        worst: "Key sales leads resign due to equity value uncertainties.",
        recovery: "Estimated recovery duration: 18 months.",
        boardNote: "Urgent cash management oversight required by the Audit Committee."
      },
      strong: {
        summary: "Bridge financing and structured cost controls stabilize runway and preserve corporate integrity.",
        expected: "Bridge round closed. Burn compressed by 25%. Product roadmap delayed by 3 months.",
        worst: "Flat-valuation bridge round triggers dilution clauses for early employees.",
        recovery: "Estimated recovery duration: 9 months.",
        boardNote: "Management's quick stabilization steps successfully protect the core operating asset."
      },
      aggressive: {
        summary: "Transitioning to self-sustainability removes external capital dependencies and strengthens IPO posture.",
        expected: "EBITDA break-even achieved. Corporate growth continues using internal cash generation.",
        worst: "Growth velocity drops from 45% ARR growth to 20% ARR growth temporarily.",
        recovery: "Estimated recovery duration: 4 months.",
        boardNote: "The company's transition to a cash-generative SaaS model is highly commended."
      }
    }
  },
  {
    id: "scen-competitor-capital",
    title: "Competitor Raises Large Capital",
    category: "Commercial & Growth",
    trigger: "Our main competitor closes a massive ₹650 Crore ($80M) Series D funding round from top-tier institutional funds, initiating an aggressive price-war.",
    immediateImpact: "High attrition threat in sales teams, pricing compression on new deals (demands for 45% discounts), and market share risk.",
    affectedObjectives: [
      "500 Cr ARR Revenue Milestones Expansion"
    ],
    timeline: {
      day1: {
        operational: "Competitor funding announced. Outbound recruiters begin contacting our sales directors.",
        financial: "Sales teams request emergency discount caps to close pending enterprise deals.",
        reputation: "Industry press frames competitor as the dominant sector leader.",
        controls: "Employee non-compete enforcement clauses were outdated.",
        recovery: "Establish executive-level compensation review panel."
      },
      week1: {
        operational: "2 key sales directors resign. Pipeline conversions drop by 15% due to price comparisons.",
        financial: "Allocated ₹50 Lakhs for specialized sales retention equity pools.",
        reputation: "Competitor runs migration promotion campaigns offering direct price cuts.",
        controls: "Customer contracts lacked long-term renewal clauses.",
        recovery: "Direct founders to meet with top 10 customer accounts."
      },
      month1: {
        operational: "Sales recruitment accelerated. Direct outbound campaign launched to counter pricing comparisons.",
        financial: "Average contract value drops by 10% due to discount matching.",
        reputation: "PR announcements focus on product certifications and security standards.",
        controls: "Commission frameworks lacked multi-year incentives.",
        recovery: "Initiate product features releases emphasizing customized enterprise data privacy."
      },
      quarter1: {
        operational: "Sales pipelines stabilized. Key client churn contained at 0.5% levels.",
        financial: "Total ARR drag due to pricing matching estimated at ₹2.0 Crores.",
        reputation: "Competitor support backlogs increase, triggering buyer return inquiries.",
        controls: "Multi-year deal incentive policies approved and active.",
        recovery: "Present direct ARR remediation updates to the Board."
      },
      year1: {
        operational: "Product reliability stabilizes market share. Competitor forced to normalize burn rates.",
        financial: "Net ARR impact: ₹1.0 Crores. Cash flows fully stabilized.",
        reputation: "Re-established brand positioning as the premium secure enterprise choice.",
        controls: "Quarterly talent compensation audits and automated market price trackers active.",
        recovery: "Review long-term competitive roadmaps under normalized market conditions."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Loss of dominant market share. 30% of sales staff depart. ARR growth flatlines. Down-round valuation threat.",
        controls: "No talent retention adjustments.",
        insurance: "0% recovery.",
        comms: "Silent response, leading to sales team demoralization.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹7.0 Cr",
        cash: "- ₹8.5 Cr",
        ebitda: "-20%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Approved general pricing discounts. Resigned sales staff replaced with recruitment overhead. Sales pipeline delayed.",
        controls: "Approved tactical pricing discounts.",
        insurance: "0% recovery.",
        comms: "Standard internal notification detailing competitor moves.",
        recovery: "Sub-optimal (40% recovery)",
        revenue: "- ₹3.8 Cr",
        cash: "- ₹4.8 Cr",
        ebitda: "-11%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "10 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Targeted key staff equity retention pool, CEO direct customer alignment, and custom enterprise product upgrades.",
        controls: "Multi-year deal incentives, targeted equity retention pools active.",
        insurance: "0% recovery.",
        comms: "Direct customer success assurance briefs and premium product releases.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹1.5 Cr",
        cash: "- ₹1.8 Cr",
        ebitda: "-5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "5 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Patenting unique technologies, lock-in multi-year contract renewals with VIP support, and targeted headhunting of competitor leads.",
        controls: "Patent application filings, VIP customer support SLAs, competitor headhunting campaigns.",
        insurance: "0% recovery.",
        comms: "Public announcements of patent filings and advanced enterprise security architecture releases.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹50 L",
        cash: "- ₹70 L",
        ebitda: "-1.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "2 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "What specific sales directors are at immediate attrition risk?",
        "What is our product differentiation strategy to counter competitor pricing cuts?",
        "Are employee non-compete and IP protection contracts legally enforceable?"
      ],
      decisions: [
        "Approve ₹1.0 Cr allocation for employee retention equity pools.",
        "Authorize strategic patent filings and multi-year client renewal discounts."
      ],
      committees: ["Commercial Committee", "Nomination & Remuneration Committee"],
      escalations: ["ACV drop threshold alerts", "Executive attrition notifications"],
      immediateActions: [
        "Direct legal counsel to review non-compete clauses for all senior leads.",
        "Initiate compensation audits for engineering and sales divisions."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Failing to act leads to sales pipeline collapse, high developer churn, and severe market share loss.",
        expected: "ARR drops by ₹7.0 Cr as core accounts migrate to competitor's discounted offerings.",
        worst: "Underwriters cancel IPO plans due to falling growth velocity indicators.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Risk of valuation write-down during subsequent funding conversations."
      },
      basic: {
        summary: "Relying on price discounts alone protects some revenue but compresses SaaS operating margins.",
        expected: "Deal discounts lead to ₹3.8 Cr revenue loss. Customer retention costs double.",
        worst: "Additional departures of key engineering leads delay main roadmap releases by 6 months.",
        recovery: "Estimated recovery duration: 10 months.",
        boardNote: "Close monitoring of product delivery velocity is recommended."
      },
      strong: {
        summary: "Targeted employee retention plans and direct customer validation retain our core account base.",
        expected: "Key client accounts secured. ARR impact contained at ₹1.5 Cr. Talent churn stabilized.",
        worst: "Sales marketing budgets require an emergency increase of ₹50 Lakhs.",
        recovery: "Estimated recovery duration: 5 months.",
        boardNote: "The board commends management's focus on key relationship protection."
      },
      aggressive: {
        summary: "Accelerated product innovations and multi-year contract locks establish sustainable competitive barriers.",
        expected: "Multi-year renewals secure future ARR, limiting direct competitor impact to under ₹50 Lakhs.",
        worst: "Temporary R&D budget overrun of 15% due to accelerated patent filings.",
        recovery: "Estimated recovery duration: 2 months.",
        boardNote: "Competitive advantage maintained; customer conversion rates remain strong."
      }
    }
  },
  {
    id: "scen-partner-loss",
    title: "Loss of Key Strategic Partner",
    category: "Commercial & Growth",
    trigger: "Our primary channel integration partner, representing 35% of enterprise distribution, terminates agreement to launch a competing platform.",
    immediateImpact: "Sudden closure of major sales pipeline channels, channel conflict in active accounts, and delayed enterprise client onboarding.",
    affectedObjectives: [
      "500 Cr ARR Revenue Milestones Expansion"
    ],
    timeline: {
      day1: {
        operational: "Partner termination notice received. Direct sales team begins audits of shared customer accounts.",
        financial: "Projected channel pipeline conversion rates downgraded. Sales bookings forecasts reduced.",
        reputation: "Partner briefs mutual clients on their upcoming proprietary technology alternative.",
        controls: "Partnership contracts lacked multi-year termination warning notices.",
        recovery: "Initiate direct contact with all shared enterprise pipeline deals."
      },
      week1: {
        operational: "Channel pipeline review reveals ₹15 Crores of pending pipeline at risk. Direct sales team expanded.",
        financial: "Allocated ₹40 Lakhs for direct sales hiring and outbound marketing.",
        reputation: "Clients express confusion regarding product support lines.",
        controls: "Intellectual property usage restrictions in partnership agreements verified.",
        recovery: "Publish official client statement guaranteeing uninterrupted support services."
      },
      month1: {
        operational: "Direct sales representatives assigned to all partner-sourced accounts. Customer success support doubled.",
        financial: "CAC (Customer Acquisition Cost) increases by 18% due to direct sales transition.",
        reputation: "Industry events focus on Navis's direct enterprise delivery models.",
        controls: "Customer registration processes updated to require direct corporate contracts.",
        recovery: "Deploy targeted migration support incentives for shared client accounts."
      },
      quarter1: {
        operational: "First direct client conversion closed. Pipeline conversion speeds normalize.",
        financial: "Total transitional revenue impact estimated at ₹2.0 Crores.",
        reputation: "Partner's competing platform launch meets product stability delays.",
        controls: "Direct channel sales models certified and active.",
        recovery: "Conduct comprehensive direct-to-market outbound strategy review."
      },
      year1: {
        operational: "Direct-to-market channels fully replace partner pipeline. Operating margins improve.",
        financial: "Net ARR impact: ₹1.0 Crores. Cash flows fully stabilized.",
        reputation: "Direct brand relationship with enterprise clients improves NPS scores.",
        controls: "Annual channel partner audits and termination reviews active.",
        recovery: "Explore new non-exclusive distribution alliances with global consultants."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Complete loss of shared client pipeline. Partner poaches 40% of shared enterprise accounts. Revenue collapses.",
        controls: "No sales channel transition plans.",
        insurance: "0% recovery (Partner termination is not covered by business insurance).",
        comms: "No customer outreach, allowing partner to control client narratives.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹6.5 Cr",
        cash: "- ₹8.2 Cr",
        ebitda: "-18%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Direct sales representatives assigned. Standard migration pricing offered. Salvages 40% of shared pipeline.",
        controls: "Assigned direct sales representatives.",
        insurance: "0% recovery.",
        comms: "Standard email notification sent to partner-sourced accounts.",
        recovery: "Sub-optimal (45% recovery)",
        revenue: "- ₹3.8 Cr",
        cash: "- ₹4.5 Cr",
        ebitda: "-11%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "10 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Founder-led customer migration meetings, VIP direct migration discounts, and legal blocks against IP infringement.",
        controls: "Direct-to-market transition plan, legal IP blocks active.",
        insurance: "0% recovery.",
        comms: "Founder-led video calls to all shared clients guaranteeing service stability.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹1.5 Cr",
        cash: "- ₹1.8 Cr",
        ebitda: "-4.5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "5 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Immediate acquisition of smaller integration agencies, direct contract takeover under preferential rates, and direct sales expansion.",
        controls: "Agency acquisitions, direct client contract transfer packages.",
        insurance: "0% recovery.",
        comms: "Press releases announcing strategic agency acquisitions and direct customer certification portals.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹50 L",
        cash: "- ₹70 L",
        ebitda: "-1.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "2 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why was such a high percentage of distribution channels concentrated in a single partner?",
        "Are there intellectual property breaches in the partner's competing platform?",
        "What is the recruitment budget required to build out our direct enterprise sales team?"
      ],
      decisions: [
        "Approve ₹60 Lakhs allocation for strategic sales expansion and legal enforcement.",
        "Authorize revised direct sales targets and CAC margins profiles."
      ],
      committees: ["Commercial Committee", "Audit Committee"],
      escalations: ["Channel pipeline drop alerts", "Legal litigation threshold reviews"],
      immediateActions: [
        "Issue formal notice of IP audit to the terminating partner.",
        "Establish direct-to-customer outreach taskforce."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Failing to act allows the partner to migrate shared customers, causing massive revenue and channel collapse.",
        expected: "Decline of all partner-sourced pipelines resulting in ₹6.5 Cr ARR drop.",
        worst: "Partner sues for client data rights, blocking active systems operations.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Risk of major channel collapse; direct sales team transition is mandatory."
      },
      basic: {
        summary: "Transitioning to direct sales without migration incentives preserves some pipeline but slows velocity.",
        expected: "Salvaging partial channel contains revenue loss at ₹3.8 Cr. CAC burn increases.",
        worst: "Product deliveries delayed due to sales team coordination gaps.",
        recovery: "Estimated recovery duration: 10 months.",
        boardNote: "Close monitoring of sales headcount productivity is recommended."
      },
      strong: {
        summary: "Founder outreach and proactive migration containment successfully secure core client ARR.",
        expected: "Core clients migrate to direct contracts, capping revenue loss at ₹1.5 Cr. Cash runways protected.",
        worst: "Legal advisory billing exceeds budget by ₹30 Lakhs.",
        recovery: "Estimated recovery duration: 5 months.",
        boardNote: "The board supports the acceleration of direct-to-market sales pipelines."
      },
      aggressive: {
        summary: "Strategic acquisitions and preferential direct pricing completely offset partner distribution risks.",
        expected: "Acquisitions restore sales capacity in 60 days, limiting net revenue drag to under ₹50 Lakhs.",
        worst: "Integration overheads temporarily compress EBITDA margins by 2%.",
        recovery: "Estimated recovery duration: 2 months.",
        boardNote: "Channel distribution risk is successfully resolved; direct-to-market margins are higher."
      }
    }
  },
  {
    id: "scen-regulator-investigation",
    title: "Regulatory Investigation by SEBI",
    category: "Legal & Regulatory Compliance",
    trigger: "SEBI audit division opens a formal inquiry into our historical accounting and board composition disclosure certificates, 3 months prior to planned IPO filing.",
    immediateImpact: "IPO prospectus filing placed on mandatory hold, audit verification fees spike, and negative disclosure alerts required in all investment presentations.",
    affectedObjectives: [
      "IPO Readiness & Listing SEBI Alignment"
    ],
    timeline: {
      day1: {
        operational: "SEBI inquiry notice received. Finance team begins consolidating all historical audit registers.",
        financial: "IPO lead book runner put on standby. Legal compliance advisory fees: ₹20 Lakhs.",
        reputation: "Underwriters suggest holding preliminary investor presentation calls.",
        controls: "Compliance archives lacked centralized storage, slowing document production.",
        recovery: "Establish dedicated board inquiry response committee."
      },
      week1: {
        operational: "Independent accounting firm engaged to run pre-audit verification checks.",
        financial: "Allocated ₹50 Lakhs for specialized corporate governance legal counsel.",
        reputation: "Institutional investment networks express caution, cooling pre-IPO demand.",
        controls: "Director appointment certificate validation process was outdated.",
        recovery: "Submit first comprehensive documentation pack to SEBI compliance officers."
      },
      month1: {
        operational: "Pre-audit verification completed. No major accounting anomalies discovered, but minor disclosure gaps identified.",
        financial: "Transitional legal billing reaches ₹90 Lakhs. IPO timelines deferred by 6 months.",
        reputation: "Apology updates sent to lead book runners. Negative investor rumors fade.",
        controls: "Board disclosure compliance tracking systems automated.",
        recovery: "Submit official remediation filing to SEBI outlining board restructure actions."
      },
      quarter1: {
        operational: "SEBI audit panel completes reviews. Settlement discussions initiated.",
        financial: "Settlement fee and administrative penalties: ₹50 Lakhs. Deferred IPO cost: ₹1.0 Crores.",
        reputation: "IPO prospectus updated with warning disclosures. Listing approvals rescheduled.",
        controls: "Director recruitment policies updated to ensure immediate seat fills.",
        recovery: "Submit final settlement documents to SEBI for formal sign-off."
      },
      year1: {
        operational: "SEBI inquiry formally closed. Prospectus approved with revised schedules. Board compliance certified.",
        financial: "Net financial impact: ₹2.4 Crores (settlement + legal counsel + deferred IPO overhead).",
        reputation: "IPO successfully completed with strong institutional subscription volumes.",
        controls: "Continuous compliance tracking and automated board filings active.",
        recovery: "Incorporate regulatory scorecard indicators into monthly executive reports."
      }
    },
    responses: {
      noIntervention: {
        outcome: "SEBI orders indefinite hold on IPO prospectus, issuing statutory penalty of ₹10 Crores for compliance neglect.",
        controls: "Disclosure systems left unchanged.",
        insurance: "0% recovery (Regulatory penalties are not covered by insurance).",
        comms: "Failure to respond, leading to media rumors and book runner exits.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹10.0 Cr",
        cash: "- ₹12.5 Cr",
        ebitda: "-25%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Inquiry responded to. Minor disclosure gaps patched. Settlement penalty of ₹2 Crores. IPO delayed by 12 months.",
        controls: "Historical disclosure certificates patched.",
        insurance: "0% recovery.",
        comms: "Standard regulatory disclosure statements published.",
        recovery: "Sub-optimal (45% recovery)",
        revenue: "- ₹4.5 Cr",
        cash: "- ₹5.5 Cr",
        ebitda: "-12%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "12 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Proactive audit validation, immediate compliance restructures, and settlement negotiations. IPO delayed by 3 months.",
        controls: "Compliance auditing automated, board disclosure systems updated.",
        insurance: "0% recovery.",
        comms: "CEO addresses lead book runners in transparent transition calls.",
        recovery: "Highly Effective (85% recovery)",
        revenue: "- ₹1.8 Cr",
        cash: "- ₹2.2 Cr",
        ebitda: "-5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Proactive settlement filing, global compliance certifications, and direct regulatory engagement. Penalty capped at ₹10 Lakhs.",
        controls: "Real-time compliance tracking databases, automated board filing portal.",
        insurance: "0% recovery.",
        comms: "Underwriter-backed public briefings and certified disclosure filings.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹40 L",
        cash: "- ₹60 L",
        ebitda: "-1.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1.5 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why were director appointment disclosure certificates not validated prior to SEBI submission?",
        "Are our historical financial audit reports fully verified by third-party checkers?",
        "What is the liability exposure of individual board directors under the active inquiry?"
      ],
      decisions: [
        "Approve allocation of ₹90 Lakhs for specialized pre-IPO legal advisory support.",
        "Authorize revised listing schedules and SEBI prospectus amendment filings."
      ],
      committees: ["Audit Committee", "Risk Committee"],
      escalations: ["Regulatory inquiry threshold warnings", "IPO postponement approvals"],
      immediateActions: [
        "Engage premium corporate governance counsel.",
        "Direct company secretary to consolidate all historical disclosure archives."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting regulatory audits leads to indefinite listing bans, massive reputational damage, and underwriter exits.",
        expected: "Statutory fine of ₹10 Crores and total cancellation of IPO registration.",
        worst: "Director suspension orders issued by corporate affairs authorities.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Existential risk to listing schedules; direct founder intervention required."
      },
      basic: {
        summary: "Standard responses satisfy requirements but fail to contain major settlement costs and delays.",
        expected: "Disclosure gaps patched, fine settled at ₹2 Crores. Runway burn rate increases.",
        worst: "Venture capital backers request emergency board seats to manage compliance.",
        recovery: "Estimated recovery duration: 12 months.",
        boardNote: "Close legal cost oversight is highly recommended during this phase."
      },
      strong: {
        summary: "Proactive disclosure remediation and rapid settlements contain listing delays.",
        expected: "Prospectus amended and approved by SEBI. Net financial drag: ₹1.8 Crores.",
        worst: "Listing valuation compressed by 10% due to negative market disclosures.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "Management's quick containment actions are supported by book runners."
      },
      aggressive: {
        summary: "Proactive compliance auditing and immediate settlement filing remove listing hurdles completely.",
        expected: "Inquiry closed with minimal penalty. Prospectus approved under original target schedules.",
        worst: "Product roadmap timelines delayed by 2 weeks due to executive compliance focus.",
        recovery: "Estimated recovery duration: 1.5 months.",
        boardNote: "Regulatory compliance certified as complete; IPO listing schedules stabilized."
      }
    }
  },
  {
    id: "scen-bankruptcy-client",
    title: "Large Enterprise Client Bankruptcy",
    category: "Financial & Liquidity",
    trigger: "Our largest enterprise client representing 20% of annual recurring revenue files for corporate insolvency, default-writing off ₹8 Crores of outstanding receivables.",
    immediateImpact: "Sudden cash flow deficit, immediate write-down of current assets, and cash runway compression from 18 to 11 months.",
    affectedObjectives: [
      "500 Cr ARR Revenue Milestones Expansion"
    ],
    timeline: {
      day1: {
        operational: "Insolvency filings received from client's legal administrator. Customer access accounts placed on view-only mode.",
        financial: "Immediate write-off of ₹8 Crores in outstanding invoice values. Cash burn projections updated.",
        reputation: "News of client's bankruptcy surfaces. Sales team checks other customer accounts for correlation.",
        controls: "Credit limit allocation guidelines failed to flag client's exposure threshold.",
        recovery: "File formal claim with insolvency administrator."
      },
      week1: {
        operational: "Risk sweep of all client accounts representing >5% of revenue completed. No similar credit warnings found.",
        financial: "Allocated ₹30 Lakhs for specialized debt recovery legal services.",
        reputation: "Competitors suggest our revenue pipeline is structurally unstable.",
        controls: "Customer credit checks were conducted annually instead of quarterly.",
        recovery: "Engage debt recovery agency to trace administrator payouts."
      },
      month1: {
        operational: "Internal sales targets revised to focus on mid-market diversification. Marketing budgets restructured.",
        financial: "EBITDA margins compress by 4.5% due to write-off drag.",
        reputation: "Corporate PR updates emphasize cash preservation and SaaS diversity profiles.",
        controls: "Automated credit monitoring alert tools integrated into billing database.",
        recovery: "Execute cost-efficiency sweeps across non-revenue generating product departments."
      },
      quarter1: {
        operational: "Mid-market pipeline conversions accelerate, replacing 25% of lost client revenue.",
        financial: "Direct cash impact: ₹8.5 Crores. Bridge credit line approved by banker.",
        reputation: "Financial news confirms company's liquidity stability despite client loss.",
        controls: "Multi-year deal incentive structures updated to reduce single-client concentration.",
        recovery: "Present direct ARR remediation progress to the Board."
      },
      year1: {
        operational: "SaaS revenue pipeline diversified. No single client represents >8% of ARR.",
        financial: "ARR metrics recover. Net write-off drag contained. Runway restored to 16 months.",
        reputation: "Enterprise brand credibility fully restored in commercial finance networks.",
        controls: "Quarterly credit audits and automated exposure monitors active.",
        recovery: "Conduct independent review of client credit allocation policies."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Cascading cash deficit. Covenants breach in debt lines, leading to bank loan recall. Corporate distress restructuring required.",
        controls: "No credit monitoring adjustments.",
        insurance: "0% recovery (Trade credit insurance was not maintained).",
        comms: "Radio silence leading to vendor panic and payment freezes.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹8.0 Cr",
        cash: "- ₹10.5 Cr",
        ebitda: "-25%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Write-off executed. Minor budget cuts deployed. Credit line accessed to offset cash deficit. IPO delayed by 12 months.",
        controls: "Credit checks set to quarterly validation.",
        insurance: "0% recovery.",
        comms: "Standard static financial disclosure statements published.",
        recovery: "Sub-optimal (40% recovery)",
        revenue: "- ₹4.8 Cr",
        cash: "- ₹6.2 Cr",
        ebitda: "-14%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "12 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Insolvency administrator claim filed, debt recovery active. Mid-market conversions contain ARR drop at ₹2.5 Crores.",
        controls: "Credit warning alerts automated, single-client limits active.",
        insurance: "40% recovery via trade credit policy claim.",
        comms: "CEO-led transparent client and book runner transition calls.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹2.5 Cr",
        cash: "- ₹3.2 Cr",
        ebitda: "-6.5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "6 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Immediate trade credit insurance payout closed. Outbound pipeline acceleration replaces ARR. Zero cash runway degradation.",
        controls: "Comprehensive trade credit policy updates, real-time exposure database.",
        insurance: "90% recovery of written-off receivables under credit policy.",
        comms: "Public announcements detailing credit protection covers and diversified ARR metrics.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹80 L",
        cash: "- ₹1.1 Cr",
        ebitda: "-2.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why was a single client allowed to reach 20% concentration without credit insurance?",
        "What are the recovery payout projections from the client's insolvency administrator?",
        "What credit monitoring controls are in place for our top 5 remaining customers?"
      ],
      decisions: [
        "Approve write-off of ₹8 Crores and authorize bridge credit line activation.",
        "Approve mandate for trade credit insurance on all contracts representing >5% ARR."
      ],
      committees: ["Finance Committee", "Audit Committee"],
      escalations: ["Asset write-off threshold warnings", "Credit line covenant compliance reviews"],
      immediateActions: [
        "Direct legal counsel to file formal proofs of debt with administrator.",
        "Audit credit profiles of remaining top 10 enterprise customers."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting client credit exposure results in severe cash deficits, loan recalls, and business insolvency.",
        expected: "Asset write-offs exhaust all cash runway, causing payment freezes on SaaS hosting platforms.",
        worst: "Involuntary corporate liquidation procedures initiated by credit bankers.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Immediate capital infusion of ₹10 Crores is required to prevent credit default."
      },
      basic: {
        summary: "Basic budget cuts stabilize runway but fail to contain margin compression and IPO delays.",
        expected: "Runway extended using credit lines. Interest costs drag profitability metrics.",
        worst: "VC backers request valuation downward revisions to provide bridge finance.",
        recovery: "Estimated recovery duration: 12 months.",
        boardNote: "Audit Committee to supervise legal debt recovery budgets closely."
      },
      strong: {
        summary: "Trade credit insurance claims and outbound pipeline diversifications contain financial exposures.",
        expected: "Insurance recovery of 40% approved. Mid-market sales contain net ARR loss at ₹2.5 Crores.",
        worst: "Transitional legal costs exceed budget allocations by ₹25 Lakhs.",
        recovery: "Estimated recovery duration: 6 months.",
        boardNote: "Management's credit containment decisions are supported by board bankers."
      },
      aggressive: {
        summary: "Pre-backed trade credit policies and proactive sales diversifications protect corporate posture.",
        expected: "Receivables write-offs fully offset by insurance payout, limiting cash impact to ₹1.1 Crores.",
        worst: "Growth velocity delayed by 2 months to transition billing operations.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "The company's credit exposure risk is successfully resolved; pipeline diversity is high."
      }
    }
  },
  {
    id: "scen-founder-conflict",
    title: "Founder Alignment Conflict",
    category: "People & Governance",
    trigger: "Severe strategic alignment dispute between CEO and CTO over product pivot options, leading to the CTO threatening immediate exit and blocking IP rights.",
    immediateImpact: "Interruption in technical product deployments, drop in team morale, and negative governance signals to IPO book runners.",
    affectedObjectives: [
      "IPO Readiness & Listing SEBI Alignment"
    ],
    timeline: {
      day1: {
        operational: "Dispute reaches impasse. CTO blocks access to several non-core code repositories.",
        financial: "IPO prospectus drafting put on standby. Legal counsel consulting fees: ₹15 Lakhs.",
        reputation: "Rumors of founder conflict circulate in startup circles and venture networks.",
        controls: "Founder vesting agreements and IP assignment contracts were not updated since seed stages.",
        recovery: "Appoint independent board mediator to initiate conversations."
      },
      week1: {
        operational: "Vesting agreement and IP assignment contracts audited. CTO's shareholdings verified.",
        financial: "Allocated ₹50 Lakhs for transition advisory legal support.",
        reputation: "Lead underwriters request executive reassurance briefings.",
        controls: "IP assignment clauses lacked specific automated release mechanisms.",
        recovery: "Board schedules emergency conflict mediation sessions."
      },
      month1: {
        operational: "Mediation achieves structured separation agreement. CTO transfers code access blocks.",
        financial: "Vesting buyout payouts model calculated. IPO deferred by 6 months.",
        reputation: "Transparent joint board disclosure statement released. Rumors stabilize.",
        controls: "Centralized IP custody controls established under direct corporate oversight.",
        recovery: "Deploy internal communication reassurance campaign to engineering teams."
      },
      quarter1: {
        operational: "New VP of Engineering promoted to CTO role. Sprints resume.",
        financial: "buyout and severance costs reach ₹3.5 Crores. Bridge credit activated.",
        reputation: "IPO prospectus updated. Underwriters confirm neutral listing sentiment.",
        controls: "Vesting clauses updated for all remaining executive shares.",
        recovery: "Present executive succession roadmap to the Board."
      },
      year1: {
        operational: "New leadership team fully integrated. Product delivery speeds hit record velocity.",
        financial: "Net transitional drag: ₹2.8 Crores. IPO listing successfully completed.",
        reputation: "Corporate governance frameworks praised in post-IPO reports.",
        controls: "Standard succession policies and key-person backups active.",
        recovery: "Review annual executive compensation and equity incentive structures."
      }
    },
    responses: {
      noIntervention: {
        outcome: "CTO exits permanently, blocking primary codebases and claiming patent violations. IPO aborted indefinitely. VC lawsuits filed.",
        controls: "No founder mediation actions.",
        insurance: "0% recovery.",
        comms: "Failure to communicate, leading to investor lawsuits and developer exits.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹8.5 Cr",
        cash: "- ₹11.2 Cr",
        ebitda: "-24%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "CTO separation negotiated but with high IP buyout costs. Main product roadmaps delayed by 12 months.",
        controls: "Standard buyout agreements executed.",
        insurance: "0% recovery.",
        comms: "Standard internal leadership email notices sent.",
        recovery: "Sub-optimal (45% recovery)",
        revenue: "- ₹4.5 Cr",
        cash: "- ₹5.5 Cr",
        ebitda: "-12%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "12 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Structured board-led mediation, separation agreement with IP transfers, and internal CTO promotion. IPO delayed by 6 months.",
        controls: "Vesting frameworks updated, IP custody controls active.",
        insurance: "0% recovery.",
        comms: "Coordinated joint disclosure statement and direct investor assurance calls.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹1.8 Cr",
        cash: "- ₹2.2 Cr",
        ebitda: "-5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "6 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Proactive dispute resolution under pre-backed founder separation rules, IP assignment enforced, IPO schedule preserved.",
        controls: "Enforced IP assignment, pre-backed separation clauses active.",
        insurance: "0% recovery.",
        comms: "Underwriter-backed transition filings and transparent staff Town Hall.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹50 L",
        cash: "- ₹70 L",
        ebitda: "-1.8%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "2 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why were founder IP assignment agreements not updated during the subsequent funding rounds?",
        "What specific product patents are registered under the CTO's personal name?",
        "How will interim engineering leadership maintain sprint velocities during transition?"
      ],
      decisions: [
        "Approve separation settlement and buyout budget allocation of ₹3.5 Crores.",
        "Approve promotion of VP of Engineering to the CTO role."
      ],
      committees: ["Nomination & Remuneration Committee", "Risk Committee"],
      escalations: ["Founder separation SEBI disclosure filings", "Key executive vacancy alerts"],
      immediateActions: [
        "Engage independent corporate mediator to lead separation talks.",
        "Verify backup access credentials to all core code repositories."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting founder conflict results in complete product blocking, aborted IPOs, and investor lawsuits.",
        expected: "Complete loss of technical lead and blocked codebases resulting in ₹8.5 Cr ARR drag.",
        worst: "Insolvency procedures initiated due to aborted IPO listing obligations.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Existential threat to the business; immediate board mediation is mandatory."
      },
      basic: {
        summary: "Standard separation negotiations restore codebase access but with heavy financial buyout drags.",
        expected: "Codebases restored. Buyouts exhaust cash buffers, delaying IPO by 12 months.",
        worst: "Developer team departures to CTO's new startup.",
        recovery: "Estimated recovery duration: 12 months.",
        boardNote: "Close monitoring of employee morale is recommended during buyout negotiations."
      },
      strong: {
        summary: "Board-led mediation and quick internal promotions contain transition delay to 6 months.",
        expected: "CTO separation finalized. IP assets transferred. Sprints resumed under new CTO.",
        worst: "Transitional legal costs exceed budget by ₹40 Lakhs.",
        recovery: "Estimated recovery duration: 6 months.",
        boardNote: "Underwriters support the quick succession execution."
      },
      aggressive: {
        summary: "Enforcing pre-backed founder separation and IP assignment rules preserves listing schedule.",
        expected: "Transition completed in 60 days with zero codebase access blocking.",
        worst: "CTO files minor shareholder grievance lawsuits.",
        recovery: "Estimated recovery duration: 2 months.",
        boardNote: "Succesful succession execution, removing all governance listing blocks."
      }
    }
  },
  {
    id: "scen-supply-disruption",
    title: "Supply Chain Disruption",
    category: "Operational & Infrastructure",
    trigger: "Our primary hardware security token supplier declares bankruptcy, suspending all custom token logistics for enterprise customer authentication portals.",
    immediateImpact: "Delayed onboarding of 24 large financial clients, supply chain backlog of 18,000 security tokens, and contract SLA penalty risk.",
    affectedObjectives: [
      "500 Cr ARR Revenue Milestones Expansion"
    ],
    timeline: {
      day1: {
        operational: "Supplier bankruptcy notice received. Token shipping schedules frozen.",
        financial: "Enterprise onboarding pipelines placed on hold. SLA penalty tracking active.",
        reputation: "BFSI segment clients express concern regarding delayed authentication deployments.",
        controls: "Token sourcing was concentrated on a single supplier without alternative backups.",
        recovery: "Establish emergency hardware sourcing search taskforce."
      },
      week1: {
        operational: "Alternative manufacturers identified in Asia region. Verification tests initiated.",
        financial: "Allocated ₹30 Lakhs for specialized hardware verification and custom tooling.",
        reputation: "Clients requested to transition temporarily to software authenticator alternatives.",
        controls: "Vendor onboarding checklists lacked sub-tier risk evaluations.",
        recovery: "Submit custom software authenticator patches to client tech panels."
      },
      month1: {
        operational: "Alternative supplier engaged under accelerated certification agreements.",
        financial: "Hardware production unit costs increase by 15%. Direct cash impact: ₹50 Lakhs.",
        reputation: "70% of clients accept software authenticator patch. Outbound shipment backlogs drop.",
        controls: "Dual-sourcing policy established for all critical physical components.",
        recovery: "Conduct comprehensive vendor compliance review of alternative manufacturers."
      },
      quarter1: {
        operational: "First alternative hardware token batch shipped. Onboarding backlogs cleared.",
        financial: "Transitional logistics costs reach ₹1.2 Crores. Operational margins compressed.",
        reputation: "Client deployment timelines restore to baseline schedules. Trust score recovers.",
        controls: "Multi-vendor inventory management controls automated.",
        recovery: "Present direct supply chain remediation progress to the Board."
      },
      year1: {
        operational: "Dual-sourcing supply chain model fully active. Inventory reserve buffers at 90 days.",
        financial: "Net financial impact: ₹90 Lakhs. Cash flows fully stabilized.",
        reputation: "BFSI brand credibility restored. Uptime performance metrics verified.",
        controls: "Quarterly supplier credit audits and continuous inventory reviews active.",
        recovery: "Review annual supply chain compliance and capacity reports."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Complete loss of BFSI clients. 24 contract terminations, severe SLA claims, and litigation procedures.",
        controls: "No alternative vendor search.",
        insurance: "0% recovery.",
        comms: "Radio silence leading to customer trust collapse and contract terminations.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹5.5 Cr",
        cash: "- ₹6.8 Cr",
        ebitda: "-15%",
        reputation: "Critical Exposure",
        trust: "Severe Damage",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Alternative supplier engaged under standard timelines. Token shipments delayed by 6 months. Minor SLA penalties.",
        controls: "Engaged alternative supplier.",
        insurance: "0% recovery.",
        comms: "Standard email notifications sent detailing shipment delays.",
        recovery: "Sub-optimal (45% recovery)",
        revenue: "- ₹3.2 Cr",
        cash: "- ₹4.0 Cr",
        ebitda: "-8%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "8 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Dual-sourcing model activated, software token failover deployed, and client migration incentives closed. Shipments delayed by 2 months.",
        controls: "Dual-sourcing activated, software token failover active.",
        insurance: "40% recovery under business interruption cover.",
        comms: "CEO addresses client CIOs directly, providing roadmap visibility.",
        recovery: "Highly Effective (80% recovery)",
        revenue: "- ₹1.2 Cr",
        cash: "- ₹1.5 Cr",
        ebitda: "-3.5%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Pre-backed alternative manufacturers activated in 7 days, software authentication conversion deployed. Zero onboarding delays.",
        controls: "Multi-vendor backup triggers, automated software failovers active.",
        insurance: "85% cost recovery under trade supply insurance policies.",
        comms: "Press releases detailing supply chain resilience and automated deployment certifications.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹30 L",
        cash: "- ₹45 L",
        ebitda: "-1%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1.5 months",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why was such a critical authentication token concentrated in a single vendor?",
        "Are there alternative suppliers certified in domestic regions to reduce shipping delays?",
        "What is the operational testing budget required to certify alternative suppliers?"
      ],
      decisions: [
        "Approve ₹40 Lakhs allocation for alternative vendor tooling and verification testing.",
        "Approve mandate for dual-sourcing on all critical physical components."
      ],
      committees: ["Risk Committee", "Commercial Committee"],
      escalations: ["Onboarding pipeline backlog warnings", "Vendor contract termination reviews"],
      immediateActions: [
        "Direct procurement team to initiate alternative supplier search.",
        "Authorize corporate communication response and client notification sequences."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Neglecting supply chain concentrations results in severe client terminations, SLA claims, and revenue collapse.",
        expected: "Loss of all pending BFSI contracts resulting in ₹5.5 Cr ARR drag.",
        worst: "Involuntary corporate litigation procedures initiated by affected financial customers.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Existential threat to commercial pipelines; direct procurement intervention is mandatory."
      },
      basic: {
        summary: "Standard alternative vendor engagements restore shipments but fail to prevent significant onboarding delays.",
        expected: "Shipments restored after 6 months. SLA penalties drag operating margins by ₹4.0 Cr.",
        worst: "Alternative manufacturers request 30% upfront tooling cost increases.",
        recovery: "Estimated recovery duration: 8 months.",
        boardNote: "Close monitoring of supplier onboarding cycles is recommended."
      },
      strong: {
        summary: "Proactive dual-sourcing models and software authenticator updates contain supply chain exposures.",
        expected: "Core clients migrate to software auth. Net ARR impact contained at ₹1.2 Cr.",
        worst: "Transitional legal costs exceed budget by ₹20 Lakhs.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "Management's quick containment steps successfully protect the core operating asset."
      },
      aggressive: {
        summary: "Pre-backed multi-vendor structures and automated software conversions minimize supply chain risks completely.",
        expected: "Alternative supplier online in 7 days. Onboarding delays limited to under ₹30 Lakhs.",
        worst: "Tooling unit costs increase by 5% in worst-case scenario.",
        recovery: "Estimated recovery duration: 1.5 months.",
        boardNote: "Supply chain risk is successfully resolved; inventory reserve levels are high."
      }
    }
  },
  {
    id: "scen-genai",
    title: "GenAI Hallucination Liability",
    category: "Technology & Cyber Security",
    trigger: "Our new AI co-pilot feature hallucinates incorrect compliance advice for 15 enterprise banking clients, violating SEBI audit trail mandates.",
    immediateImpact: "Enterprise banking clients threaten contract termination. Immediate freeze on all AI-feature rollouts.",
    affectedObjectives: [
      "Zero-Downtime InfoSec & SOC 2 Trust Assurance",
      "Enterprise Customer Churn Prevention (<0.5%)"
    ],
    timeline: {
      day1: {
        operational: "AI co-pilot feature completely disabled. Customer success teams field urgent compliance inquiries.",
        financial: "Legal retainer for AI liability assessment activated.",
        reputation: "BFSI clients demand immediate root-cause analysis.",
        controls: "LLM guardrails and prompt-injection filters failed to catch compliance-specific hallucinations.",
        recovery: "Issue formal apology and rollback to non-AI dashboard version."
      },
      week1: {
        operational: "Forensic audit of LLM prompts reveals training data contamination.",
        financial: "Estimated SLA and compliance breach penalties: ₹3.5 Crores.",
        reputation: "Industry press questions the safety of GenAI in Indian RegTech.",
        controls: "Automated QA pipelines lacked domain-specific compliance testing.",
        recovery: "Engage external AI red-teaming agency."
      },
      month1: {
        operational: "Red-teaming complete. Narrow, deterministic AI models deployed instead of broad LLMs.",
        financial: "Net ARR drop of ₹1.2 Crores from 3 churned banking clients. NDR drops 3%.",
        reputation: "Trust begins to recover as deterministic models show zero hallucinations.",
        controls: "Human-in-the-loop (HITL) approval gates implemented for all AI advice.",
        recovery: "Present new AI governance framework to the Board."
      },
      quarter1: {
        operational: "SOC 2 auditors verify new AI governance controls.",
        financial: "Losses contained. R&D budget increased by ₹50 Lakhs for AI safety.",
        reputation: "ScaleFlow is recognized for publishing a transparent AI safety post-mortem.",
        controls: "Continuous drift monitoring and hallucination detection active.",
        recovery: "Resume AI feature rollout with strict BFSI opt-in clauses."
      },
      year1: {
        operational: "AI features fully restored under deterministic governance.",
        financial: "Net financial drag: ₹2.0 Crores. NDR recovers to 112%.",
        reputation: "Market leadership established in 'Safe Enterprise AI'.",
        controls: "Quarterly algorithmic audits by independent third parties.",
        recovery: "Incorporate AI risk metrics into standard Board pack."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Complete loss of BFSI client segment. Massive regulatory fines from SEBI.",
        controls: "No AI guardrails implemented.",
        insurance: "0% recovery (AI liability excluded from current cyber policy).",
        comms: "Radio silence, leading to panic and mass churn.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹8.0 Cr",
        cash: "- ₹10.5 Cr",
        ebitda: "-18%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 2
      },
      basic: {
        outcome: "AI disabled permanently. Growth velocity slows, missing IPO narrative targets.",
        controls: "Feature toggle disabled.",
        insurance: "0% recovery.",
        comms: "Standard feature deprecation notice.",
        recovery: "Sub-optimal (40% recovery)",
        revenue: "- ₹4.5 Cr",
        cash: "- ₹5.0 Cr",
        ebitda: "-8%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "12 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "HITL implementation and deterministic models contain the damage. Growth resumes after 1 quarter.",
        controls: "HITL gates, deterministic fallback.",
        insurance: "20% legal cost recovery.",
        comms: "Transparent CEO webinar on AI safety.",
        recovery: "Highly Effective (85% recovery)",
        revenue: "- ₹1.5 Cr",
        cash: "- ₹2.0 Cr",
        ebitda: "-3%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "3 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Immediate rollout of verified deterministic models and aggressive patenting of AI safety layers.",
        controls: "Proprietary hallucination filters, real-time drift monitoring.",
        insurance: "50% recovery.",
        comms: "Industry-leading whitepaper on RegTech AI Safety published.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹50 L",
        cash: "- ₹80 L",
        ebitda: "-1%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "1 month",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why was a non-deterministic LLM deployed in a highly regulated compliance workflow?",
        "Does our current cyber insurance policy explicitly cover AI-generated liabilities?",
        "What is the impact on our IPO 'AI-native' valuation narrative?"
      ],
      decisions: [
        "Approve ₹50 Lakhs budget for independent AI red-teaming audits.",
        "Authorize immediate updates to Enterprise Terms of Service regarding AI outputs."
      ],
      committees: ["Technology Committee", "Risk Committee"],
      escalations: ["BFSI contract breach thresholds", "SEBI regulatory disclosure"],
      immediateActions: [
        "Suspend all generative AI features globally.",
        "Engage specialized AI legal counsel."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Ignoring AI risks leads to catastrophic regulatory fines and the complete loss of the BFSI market segment.",
        expected: "Complete loss of BFSI segment resulting in ₹8.0 Cr ARR drag.",
        worst: "SEBI imposes direct fines for compliance manipulation.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Existential threat to the company's regulatory standing."
      },
      basic: {
        summary: "Permanently disabling AI saves the clients but destroys the company's valuation multiple.",
        expected: "ARR drops by ₹4.5 Cr as clients churn to true AI-native competitors.",
        worst: "IPO valuation is cut by 40% due to lack of AI growth story.",
        recovery: "Estimated recovery duration: 12 months.",
        boardNote: "Close monitoring of competitor AI capabilities is recommended."
      },
      strong: {
        summary: "Deploying deterministic models and HITL gates restores trust and stabilizes the platform.",
        expected: "ARR drag contained at ₹1.5 Cr. NDR recovers quickly.",
        worst: "R&D costs increase, compressing margins slightly.",
        recovery: "Estimated recovery duration: 3 months.",
        boardNote: "Management's pivot to 'Safe AI' is highly commended."
      },
      aggressive: {
        summary: "Transforming the crisis into a thought-leadership opportunity on AI safety captures new market share.",
        expected: "No enterprise churn. ARR drag limited to ₹50 Lakhs.",
        worst: "Slight delay in product roadmap.",
        recovery: "Estimated recovery duration: 1 month.",
        boardNote: "The company has set a new industry standard for RegTech AI."
      },
      executiveBrief: {
        ceoMemo: "Board Members,\n\nOur recently launched AI Co-Pilot has hallucinated SEBI compliance advice for 15 of our tier-1 banking clients. I have executed an immediate global kill-switch on all LLM features. While this hurts our 'AI-native' marketing narrative ahead of the IPO, it is the only way to prevent a mass exodus of our BFSI segment. Our NDR is currently at risk of dropping 3%. We are deploying a deterministic fallback architecture immediately.",
        legalCounsel: "Providing automated, incorrect regulatory advice exposes us to direct SEBI penalties and material breach of contract claims from our banking clients. Our current cyber liability insurance explicitly excludes 'AI Hallucination and Algorithmic Errors'. We must amend our Master Service Agreements immediately to enforce a 'human-in-the-loop' liability waiver for all AI features."
      }
    }
  },
  {
    id: "scen-supply-chain",
    title: "Third-Party API Supply Chain Attack",
    category: "Technology & Cyber Security",
    trigger: "A trusted third-party analytics vendor integrated into our platform is compromised, creating a backdoor that extracts encrypted customer session tokens.",
    immediateImpact: "Widespread session hijacking risk. Immediate invalidation of all active user sessions across 800+ enterprise deployments.",
    affectedObjectives: [
      "Zero-Downtime InfoSec & SOC 2 Trust Assurance"
    ],
    timeline: {
      day1: {
        operational: "Breach detected by anomaly monitoring. Third-party API immediately severed. All user sessions invalidated.",
        financial: "Incident response activation costs: ₹15 Lakhs.",
        reputation: "Users complain of sudden logouts. Status page updated with 'Security Maintenance'.",
        controls: "Third-party vendor risk assessment failed to identify the vendor's weak CI/CD pipeline.",
        recovery: "Force global password resets and MFA re-authentication."
      },
      week1: {
        operational: "Forensic analysis confirms the backdoor. Analytics integration permanently removed.",
        financial: "SLA penalties for service degradation estimated at ₹30 Lakhs.",
        reputation: "Public disclosure made regarding the supply chain attack. Industry applauds rapid response.",
        controls: "Strict egress filtering and network isolation rules implemented for all external APIs.",
        recovery: "Audit all other third-party integrations."
      },
      month1: {
        operational: "Internal analytics engine deployed to replace the compromised vendor.",
        financial: "Net ARR drop of ₹50 Lakhs due to delayed sales cycles.",
        reputation: "Customer trust remains high due to transparent communication.",
        controls: "Zero-trust architecture enforced for all microservices.",
        recovery: "Present updated vendor risk management policy to the Board."
      },
      quarter1: {
        operational: "SOC 2 compliance re-certified. Security posture strengthened.",
        financial: "Losses contained. R&D budget reallocated to internal tooling.",
        reputation: "ScaleFlow cited in industry reports as a model for supply chain incident response.",
        controls: "Automated API behavioral monitoring active.",
        recovery: "Submit final incident report to enterprise clients."
      },
      year1: {
        operational: "All third-party dependencies either internalized or placed under strict zero-trust proxies.",
        financial: "Net financial drag: ₹80 Lakhs. NDR unaffected.",
        reputation: "Market leadership in secure SaaS established.",
        controls: "Quarterly penetration testing of all API endpoints.",
        recovery: "Incorporate supply chain risk into continuous monitoring."
      }
    },
    responses: {
      noIntervention: {
        outcome: "Massive data exfiltration leading to severe regulatory fines and client churn.",
        controls: "No action taken on third-party APIs.",
        insurance: "0% recovery.",
        comms: "Silent response.",
        recovery: "Critical Failure (0% recovery)",
        revenue: "- ₹6.0 Cr",
        cash: "- ₹7.5 Cr",
        ebitda: "-15%",
        reputation: "Critical Exposure",
        trust: "Severe Breach",
        escalation: "Level 4 (Board Escalation)",
        appetite: "Out of Appetite",
        duration: "Indefinite",
        objectivesAffected: 1
      },
      basic: {
        outcome: "Vendor severed, but lack of communication leads to client suspicion.",
        controls: "API severed.",
        insurance: "0% recovery.",
        comms: "Standard maintenance notice.",
        recovery: "Sub-optimal (40% recovery)",
        revenue: "- ₹3.0 Cr",
        cash: "- ₹3.5 Cr",
        ebitda: "-8%",
        reputation: "Elevated Exposure",
        trust: "Moderate Impact",
        escalation: "Level 3 (Executive Push)",
        appetite: "Near Appetite Bounds",
        duration: "8 months",
        objectivesAffected: 1
      },
      strong: {
        outcome: "Rapid severance, forced re-auth, and transparent comms contain the threat completely.",
        controls: "Egress filtering, global session invalidation.",
        insurance: "60% recovery of forensic costs.",
        comms: "Transparent incident report.",
        recovery: "Highly Effective (85% recovery)",
        revenue: "- ₹80 L",
        cash: "- ₹1.0 Cr",
        ebitda: "-2%",
        reputation: "Managed Exposure",
        trust: "Minor Impact",
        escalation: "Level 2 (Committee Audit)",
        appetite: "Within Appetite Bounds",
        duration: "2 months",
        objectivesAffected: 0
      },
      aggressive: {
        outcome: "Immediate internalization of the capability and aggressive legal action against the vendor.",
        controls: "Zero-trust API proxies, internal analytics engine.",
        insurance: "90% recovery.",
        comms: "Industry-leading technical post-mortem published.",
        recovery: "Optimized (95% recovery)",
        revenue: "- ₹20 L",
        cash: "- ₹40 L",
        ebitda: "-0.5%",
        reputation: "Negligible Impact",
        trust: "Fully Maintained",
        escalation: "Level 1 (Operational Resolution)",
        appetite: "Within Appetite Bounds",
        duration: "2 weeks",
        objectivesAffected: 0
      }
    },
    boardActions: {
      questions: [
        "Why did our egress filtering allow session tokens to be transmitted to the analytics vendor?",
        "Are we overly reliant on unvetted third-party integrations for core platform features?",
        "What is our legal recourse against the compromised vendor?"
      ],
      decisions: [
        "Approve immediate termination of the vendor contract.",
        "Authorize ₹40 Lakhs budget for internalizing critical third-party dependencies."
      ],
      committees: ["Technology Committee", "Risk Committee"],
      escalations: ["Vendor contract breach", "Enterprise client security notification"],
      immediateActions: [
        "Sever API connection immediately.",
        "Force global session invalidation."
      ]
    },
    narratives: {
      noIntervention: {
        summary: "Ignoring the supply chain attack leads to mass session hijacking and devastating brand damage.",
        expected: "Complete loss of trust, ₹6.0 Cr ARR drag.",
        worst: "Class action lawsuits from affected clients.",
        recovery: "Estimated recovery duration: Indefinite.",
        boardNote: "Immediate replacement of CISO required."
      },
      basic: {
        summary: "Severing the API stops the bleeding, but poor communication damages client trust.",
        expected: "ARR drops by ₹3.0 Cr as clients churn.",
        worst: "Clients demand independent audits before renewing.",
        recovery: "Estimated recovery duration: 8 months.",
        boardNote: "Communication strategy needs urgent review."
      },
      strong: {
        summary: "Decisive action and transparent communication turn a crisis into a display of competence.",
        expected: "ARR drag contained at ₹80 Lakhs.",
        worst: "Temporary slowdown in new sales.",
        recovery: "Estimated recovery duration: 2 months.",
        boardNote: "Incident response protocols executed perfectly."
      },
      aggressive: {
        summary: "Rapid internalization of the capability eliminates the risk permanently and strengthens the platform.",
        expected: "Negligible revenue impact.",
        worst: "Slight increase in R&D costs.",
        recovery: "Estimated recovery duration: 2 weeks.",
        boardNote: "Management has successfully hardened the supply chain."
      },
      executiveBrief: {
        ceoMemo: "Board Members,\n\nWe detected a backdoor in our third-party analytics vendor attempting to exfiltrate session tokens. I have severed the integration and forced a global logout for all 800+ enterprise clients. This causes immediate friction, but it guarantees zero data loss. We are internalizing this capability to ensure our pre-IPO security narrative remains bulletproof.",
        legalCounsel: "We are initiating breach of contract proceedings against the vendor. We must notify all enterprise clients within 24 hours per our SLA commitments. Our proactive session invalidation mitigates any actual data breach liability under the DPDPA, limiting our exposure strictly to minor SLA downtime credits."
      }
    }
  }
];
