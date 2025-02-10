import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CompanyContext {
  name: string;
  description: string;
  industry: string;
  strategicPriorities: string[];
  marketFocus: string[];
  aiStrategy: {
    principles: string[];
    initiatives: string[];
    governance: string[];
    partnerships: string[];
  };
  corePillars: string[];
  esgInitiatives: {
    inclusionEfforts: string[];
    communityDevelopment: string[];
    accessibilityCommitments: string[];
    financialInclusion: {
      programs: string[];
      investments: {
        description: string;
        amount: string;
      }[];
    };
  };
  clientExperience: {
    digitalTools: {
      name: string;
      description: string;
      metrics?: string;
    }[];
    segmentInitiatives: {
      segment: string;
      offerings: string[];
      features: string[];
    }[];
    serviceEnhancements: string[];
  };
  businessPerformance: {
    financialMetrics: {
      metric: string;
      value: string;
      change?: string;
    }[];
    strategicExecution: {
      focus: string;
      achievements: string[];
    }[];
    growthAreas: string[];
    strengths: string[];
  };
  digitalEngagement: {
    metrics: {
      metric: string;
      value: string;
      context?: string;
    }[];
    channels: {
      name: string;
      performance: string[];
    }[];
    innovations: string[];
  };
  consumerFranchise: {
    growth: {
      metric: string;
      value: string;
      segment?: string;
    }[];
    keySegments: {
      name: string;
      initiatives: string[];
      performance: string[];
    }[];
    marketExpansion: string[];
  };
  businessLines: {
    commercialBanking: {
      regions: {
        name: string;
        focus: string[];
        performance: string[];
      }[];
      strategy: string[];
    };
    wealthManagement: {
      regions: {
        name: string;
        metrics: {
          metric: string;
          value: string;
        }[];
        highlights: string[];
      }[];
      achievements: string[];
    };
    capitalMarkets: {
      performance: {
        area: string;
        metrics: string[];
      }[];
      usGrowth: {
        metric: string;
        value: string;
      }[];
      innovations: string[];
    };
    directFinancialServices: {
      growth: string;
      focus: string[];
    };
  };
  aiInnovation: {
    achievements: string[];
    implementations: {
      name: string;
      purpose: string;
    }[];
    rankings: {
      metric: string;
      achievement: string;
    }[];
  };
  communityImpact: {
    initiatives: {
      name: string;
      description: string;
      metrics: {
        metric: string;
        value: string;
      }[];
    }[];
    focus: string[];
  };
  teamDevelopment: {
    leadership: {
      focus: string[];
      initiatives: string[];
    };
    engagement: {
      metric: string;
      value: string;
      benchmark?: string;
    }[];
    priorities: string[];
  };
  futureOutlook: {
    strategy: string[];
    focus: string[];
    strengths: string[];
    priorities: string[];
  };
}

const CIBC_CONTEXT: CompanyContext = {
  name: "CIBC",
  description: "A leading North American financial institution committed to creating enduring value for stakeholders through modern relationship-oriented banking, digital innovation, and sustainable practices, while championing economic and financial inclusion.",
  industry: "Financial Services/Banking",
  strategicPriorities: [
    "Growing mass affluent and private wealth franchise in Canada and U.S.",
    "Expanding digital-first personal banking capabilities in Canada",
    "Delivering connectivity and differentiation to clients",
    "Enabling, simplifying and protecting our bank"
  ],
  marketFocus: [
    "Personal Banking",
    "Business Banking",
    "Commercial Banking",
    "Wealth Management",
    "Capital Markets",
    "Digital Banking Innovation",
    "Client Experience Enhancement",
    "Risk Management and Security",
    "Sustainable Banking"
  ],
  aiStrategy: {
    principles: [
      "Building AI capabilities on a foundation of trust and responsibility",
      "Ensuring compliance with CIBC Trustworthy AI Principles",
      "Maintaining strong risk management frameworks",
      "Focusing on transparent and ethical AI development"
    ],
    initiatives: [
      "Implementing Generative AI in select business areas",
      "Developing AI-powered tools for frontline team efficiency",
      "Scaling AI solutions across the enterprise",
      "Hiring 200+ data and AI roles for operational scaling",
      "Award-winning Knowledge Central Generative AI pilot"
    ],
    governance: [
      "Enterprise AI Framework implementation",
      "Enterprise AI Governance Office oversight",
      "Enhanced cybersecurity strategy",
      "ESG disclosure requirements integration",
      "Rigorous system and network monitoring"
    ],
    partnerships: [
      "Creative Destruction Lab collaboration",
      "Vector Institute partnership for professional development",
      "MaRS Discovery District innovation partnership",
      "Focus on AI bias reduction and inclusive design"
    ]
  },
  corePillars: [
    "Integrity and Trust",
    "Responsible AI Innovation",
    "Cybersecurity Excellence",
    "Talent Development",
    "Inclusive Design",
    "ESG Leadership",
    "Community Impact"
  ],
  esgInitiatives: {
    inclusionEfforts: [
      "Support for Black community, Indigenous community, and people with disabilities",
      "Five-year accessibility roadmap implementation",
      "Accessibility Action Committee with executive sponsorship",
      "Annual Accessibility Innovation Conference",
      "Employee eLearning for inclusive interactions"
    ],
    communityDevelopment: [
      "Unified philanthropic strategy across U.S. and Canada",
      "CIBC Foundation grants for economic and financial inclusion",
      "Affordable housing initiatives in U.S. and Canada",
      "Indigenous Housing Loan Program partnerships",
      "Support for skilled trades education and development"
    ],
    accessibilityCommitments: [
      "Accessibility Innovation Conference",
      "Inclusive design principles",
      "Employee training for inclusive client interactions",
      "Executive-sponsored Accessibility Action Committee",
      "Regular progress reporting to Inclusion Leadership Council"
    ],
    financialInclusion: {
      programs: [
        "Indigenous Housing Loan Program",
        "Skilled trades banking offer",
        "Newcomer banking bundle",
        "CIBC Co-Op Student Award for Equity and Excellence",
        "Post-secondary financial support awards and bursaries"
      ],
      investments: [
        {
          description: "U.S. affordable housing projects",
          amount: "US$123 million for 500 units"
        },
        {
          description: "First Nations housing partnerships",
          amount: "$34.5 million in authorized lending"
        },
        {
          description: "Skilled trades education scholarships",
          amount: "$250,000+"
        }
      ]
    }
  },
  clientExperience: {
    digitalTools: [
      {
        name: "CIBC Smart Planner",
        description: "Provides clients timely insights into spending habits to help track and manage financial goals",
        metrics: "Used by 645,000+ clients since launch"
      },
      {
        name: "CIBC GoalPlanner",
        description: "Platform for building personalized financial plans with advisors",
        metrics: "Served 398,000+ households"
      },
      {
        name: "CIBC Smart Arrival",
        description: "Digital onboarding for newcomers, enabling account opening in 10 minutes with pre-arrival fund deposits"
      },
      {
        name: "CIBC Best Student Life Bundle",
        description: "Digital-exclusive offer for students to apply for essential banking needs in under 15 minutes"
      }
    ],
    segmentInitiatives: [
      {
        segment: "Imperial Service",
        offerings: [
          "Exclusive offers and partnerships",
          "Personalized client journeys",
          "Regular and consistent engagement",
          "Enhanced value proposition"
        ],
        features: [
          "Tailored insights and advice",
          "Dedicated financial advisors",
          "Segment-specific benefits"
        ]
      },
      {
        segment: "Newcomers",
        offerings: [
          "Pre-arrival account setup",
          "Direct fund deposits before arrival",
          "Streamlined credit card applications",
          "Bundled banking solutions"
        ],
        features: [
          "10-minute account opening",
          "Pre-arrival banking setup",
          "Simplified documentation"
        ]
      },
      {
        segment: "Students",
        offerings: [
          "Digital-exclusive banking bundle",
          "Fast-track application process",
          "Comprehensive banking package"
        ],
        features: [
          "15-minute application process",
          "Essential banking needs coverage",
          "International student support"
        ]
      }
    ],
    serviceEnhancements: [
      "Client feedback-driven improvements",
      "Enhanced digital journey",
      "Deeper relationship building",
      "Trusted advisor approach",
      "Personalized financial planning",
      "Streamlined onboarding processes"
    ]
  },
  businessPerformance: {
    financialMetrics: [
      {
        metric: "Net Income",
        value: "$7.2 billion",
        change: "Record earnings"
      },
      {
        metric: "Earnings Per Share",
        value: "$7.28"
      },
      {
        metric: "Adjusted Earnings Per Share",
        value: "$7.40"
      },
      {
        metric: "Revenue",
        value: "$25.6 billion",
        change: "Up 10% year-over-year"
      },
      {
        metric: "Adjusted Pre-provision Pre-tax Earnings",
        value: "$11.33 billion",
        change: "Up 11% year-over-year"
      },
      {
        metric: "CET1 Ratio",
        value: "13.3%"
      }
    ],
    strategicExecution: [
      {
        focus: "Client-Focused Growth",
        achievements: [
          "Increased client experience scores",
          "Deepened client relationships",
          "Enhanced cross-border capabilities",
          "Improved operational efficiency"
        ]
      },
      {
        focus: "Resource Allocation",
        achievements: [
          "Strategic talent deployment",
          "Investment in growth opportunities",
          "Platform differentiation",
          "Connected culture development"
        ]
      },
      {
        focus: "Business Development",
        achievements: [
          "New client acquisition",
          "Relationship deepening",
          "Geographic platform expansion",
          "Prudent risk management"
        ]
      }
    ],
    growthAreas: [
      "Cross-border business expansion",
      "Client relationship deepening",
      "Platform differentiation",
      "Geographic market penetration",
      "Organic growth opportunities"
    ],
    strengths: [
      "Strong capital position",
      "Consistent strategy execution",
      "Client-focused approach",
      "Operational discipline",
      "Connected culture",
      "Geographic diversification"
    ]
  },
  digitalEngagement: {
    metrics: [
      {
        metric: "Digital Engagement Rate",
        value: "87%",
        context: "Demonstrates robust digital channel adoption"
      },
      {
        metric: "Digital Product Opening",
        value: "38%",
        context: "New products opened through digital channels"
      },
      {
        metric: "Smart Planner Adoption",
        value: "645,000+ clients",
        context: "Since launch for goal management and spending tracking"
      },
      {
        metric: "GoalPlanner Usage",
        value: "398,000+ households",
        context: "Advisor-assisted financial planning"
      }
    ],
    channels: [
      {
        name: "CIBC Digital Banking",
        performance: [
          "High client engagement",
          "Streamlined product opening",
          "Enhanced self-service capabilities"
        ]
      },
      {
        name: "Simplii Financial",
        performance: [
          "Growing digital-first brand",
          "Increased self-serve adoption",
          "Expanded service offerings"
        ]
      }
    ],
    innovations: [
      "Generative AI implementation",
      "Technology platform investments",
      "Digital channel enhancements",
      "Self-service optimization",
      "Smart tool development"
    ]
  },
  consumerFranchise: {
    growth: [
      {
        metric: "Net New Clients",
        value: "613,000+",
        segment: "Canadian consumer platforms"
      },
      {
        metric: "Student Growth",
        value: "Robust",
        segment: "Key future growth segment"
      },
      {
        metric: "Newcomer Growth",
        value: "Robust",
        segment: "Key future growth segment"
      }
    ],
    keySegments: [
      {
        name: "Imperial Service",
        initiatives: [
          "Technology investments",
          "Team enhancement",
          "Mass affluent market focus"
        ],
        performance: [
          "Strong growth trajectory",
          "Increased client adoption",
          "Enhanced value proposition"
        ]
      },
      {
        name: "Skilled Trades",
        initiatives: [
          "First-to-market banking package",
          "Specialized financial solutions",
          "Career support focus"
        ],
        performance: [
          "Market innovation leadership",
          "Segment expansion",
          "New client acquisition"
        ]
      }
    ],
    marketExpansion: [
      "Mass affluent market growth",
      "Student segment development",
      "Newcomer market penetration",
      "Skilled trades focus",
      "Digital-first engagement"
    ]
  },
  businessLines: {
    commercialBanking: {
      regions: [
        {
          name: "Canada",
          focus: [
            "Prudent growth approach",
            "Strong credit quality maintenance",
            "Sector-specific expertise",
            "High-quality growth foundation"
          ],
          performance: [
            "Maintained credit strength",
            "Strategic sector focus",
            "Client relationship depth"
          ]
        },
        {
          name: "United States",
          focus: [
            "Strategic market expansion",
            "Commercial and industrial focus",
            "Fast-growing market presence",
            "Portfolio optimization"
          ],
          performance: [
            "Strong growth in key markets",
            "Portfolio transition success",
            "Geographic expansion"
          ]
        }
      ],
      strategy: [
        "Focus on entrepreneurs and business owners",
        "Integration with wealth management",
        "Geographic market selection",
        "Portfolio quality emphasis",
        "Selective growth approach"
      ]
    },
    wealthManagement: {
      regions: [
        {
          name: "Canada",
          metrics: [
            {
              metric: "Assets Under Administration Growth",
              value: "30% year-over-year"
            },
            {
              metric: "Long-term Mutual Funds Ranking",
              value: "#1 among Big 6 banks"
            }
          ],
          highlights: [
            "Strong distribution network",
            "Quality asset management",
            "Advice-based channel strength"
          ]
        },
        {
          name: "United States",
          metrics: [
            {
              metric: "Assets Under Administration Growth",
              value: "15% year-over-year"
            }
          ],
          highlights: [
            "Technology investments",
            "Talent acquisition",
            "Market expansion"
          ]
        }
      ],
      achievements: [
        "Market leadership in fund sales",
        "Strong AUA growth",
        "Enhanced distribution capabilities",
        "Technology platform advancement"
      ]
    },
    capitalMarkets: {
      performance: [
        {
          area: "Debt Capital Markets",
          metrics: [
            "Record activity levels",
            "Strong client demand",
            "Market leadership"
          ]
        },
        {
          area: "Trading",
          metrics: [
            "Robust revenues",
            "Above three-year average",
            "Consistent performance"
          ]
        }
      ],
      usGrowth: [
        {
          metric: "Revenue Growth",
          value: "21% in 2024"
        },
        {
          metric: "Market Position",
          value: "Third in U.S. renewables project financing"
        },
        {
          metric: "Growth Trend",
          value: "Third consecutive year of double-digit growth"
        }
      ],
      innovations: [
        "Renewables project financing leadership",
        "Cross-border capabilities",
        "New economy focus",
        "Strategic client alignment"
      ]
    },
    directFinancialServices: {
      growth: "16% three-year cumulative annual growth rate",
      focus: [
        "Innovation delivery",
        "Client expertise",
        "Segment specialization",
        "Digital capabilities"
      ]
    }
  },
  aiInnovation: {
    achievements: [
      "Greatest year-over-year improvement in Evident AI Index",
      "Ethical AI development focus",
      "Enterprise-wide AI implementation"
    ],
    implementations: [
      {
        name: "CIBC AI Platform",
        purpose: "Foster team innovation"
      },
      {
        name: "GitHub CoPilot",
        purpose: "Boost developer productivity"
      }
    ],
    rankings: [
      {
        metric: "Evident AI Index",
        achievement: "Highest improvement among banks"
      }
    ]
  },
  communityImpact: {
    initiatives: [
      {
        name: "CIBC Run for the Cure",
        description: "Title sponsor of Canadian Cancer Society's annual fundraising event",
        metrics: [
          {
            metric: "Years as Title Sponsor",
            value: "28"
          },
          {
            metric: "Team Member Participation",
            value: "13,000"
          },
          {
            metric: "Run Sites",
            value: "53"
          },
          {
            metric: "Total Funds Raised",
            value: "$15 million"
          },
          {
            metric: "Team CIBC Contribution",
            value: "$2.5 million"
          }
        ]
      },
      {
        name: "CIBC Miracle Day",
        description: "Annual fundraising initiative for children's charities",
        metrics: [
          {
            metric: "Years Running",
            value: "40"
          },
          {
            metric: "2024 Donations",
            value: "$6 million"
          }
        ]
      }
    ],
    focus: [
      "Long-term community commitment",
      "Coast-to-coast-to-coast presence",
      "Children's charity support",
      "Healthcare initiatives",
      "Sustainable community impact"
    ]
  },
  teamDevelopment: {
    leadership: {
      focus: [
        "Building leadership bench strength",
        "Cross-functional experience",
        "Client-centric perspective",
        "Connectivity enhancement"
      ],
      initiatives: [
        "Expanded leadership accountabilities",
        "Multi-perspective client understanding",
        "Cross-team connectivity",
        "Differentiated leadership approach"
      ]
    },
    engagement: [
      {
        metric: "Employee Engagement Score",
        value: "80%",
        benchmark: "Exceeds Global Financial Services and Global High Performing Norms"
      }
    ],
    priorities: [
      "Leadership development",
      "Employee engagement",
      "Cultural enhancement",
      "Team connectivity",
      "Cross-functional understanding"
    ]
  },
  futureOutlook: {
    strategy: [
      "Client-focused approach",
      "Diversified business model",
      "Prudent management",
      "Sustainable growth",
      "Value creation"
    ],
    focus: [
      "Strategy execution",
      "Purpose-driven growth",
      "Stakeholder value",
      "Economic resilience",
      "Market adaptability"
    ],
    strengths: [
      "Strong shareholder returns",
      "Economic resilience",
      "Strategic momentum",
      "Purpose-driven culture",
      "Client impact"
    ],
    priorities: [
      "Sustainable growth",
      "Enduring value creation",
      "Strategic execution",
      "Purpose fulfillment",
      "Stakeholder engagement"
    ]
  }
};

export async function generateSoWhat(
  eventName: string,
  description: string,
  questions: { question: string }[],
  answers: { answer: string }[],
  companyContext: CompanyContext = CIBC_CONTEXT
): Promise<string> {
  const prompt = `
As a strategic advisor for ${companyContext.name}, analyze this tech event's relevance to our organization:

EVENT DETAILS:
- Name: ${eventName}
- Description: ${description}
- Key Questions: ${questions.map(q => q.question).join(', ')}
- Answers: ${answers.map(a => a.answer).join(', ')}

COMPANY CONTEXT:
${companyContext.description}

COMMUNITY IMPACT:
${companyContext.communityImpact.initiatives.map(i => 
  `${i.name}:\n${i.metrics.map(m => `- ${m.metric}: ${m.value}`).join('\n')}`
).join('\n\n')}

TEAM DEVELOPMENT:
Leadership Focus:
${companyContext.teamDevelopment.leadership.focus.map(f => `- ${f}`).join('\n')}

Employee Engagement:
${companyContext.teamDevelopment.engagement.map(e => 
  `- ${e.metric}: ${e.value}${e.benchmark ? ` (${e.benchmark})` : ''}`
).join('\n')}

FUTURE OUTLOOK:
Strategy:
${companyContext.futureOutlook.strategy.map(s => `- ${s}`).join('\n')}

Priorities:
${companyContext.futureOutlook.priorities.map(p => `- ${p}`).join('\n')}

Provide a concise 20-40 word "So What?" analysis explaining why this event might be important for CIBC. 
Focus on:
1. Alignment with future strategy
2. Impact on team development
3. Community engagement potential
4. Leadership enhancement opportunities
5. Employee engagement implications
6. Sustainable growth contribution
7. Stakeholder value creation

Be specific and actionable, highlighting direct relevance to our purpose-driven culture, commitment to sustainable growth, and focus on creating enduring value for all stakeholders.
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a strategic banking technology advisor specializing in purpose-driven transformation and sustainable growth, providing concise, insightful analysis of tech events and their implications for financial institutions committed to community impact, team development, and enduring value creation for all stakeholders."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Unable to generate analysis';
  } catch (error) {
    console.error('Error generating So What analysis:', error);
    return 'Error generating analysis';
  }
}
