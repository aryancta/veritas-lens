export type SampleArticle = {
  id: string;
  category: "real" | "fake" | "borderline";
  title: string;
  body: string;
  source: string;
  note: string;
};

export const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    id: "reuters-rates",
    category: "real",
    title: "Federal Reserve holds interest rates steady, signals two cuts later this year",
    source: "Reuters-style newswire",
    note: "Newswire-style reporting with named institutions, dates, and quoted officials.",
    body: `WASHINGTON, March 19 — The Federal Reserve on Wednesday held its benchmark interest rate steady at the 4.25%–4.50% range and indicated it still expects two quarter-point cuts before the end of the year, even as policymakers raised their inflation forecast for 2026.\n\nFed Chair Jerome Powell told reporters at a press conference that the central bank's outlook remained one of "gradual progress" toward the 2% inflation target, but added that recent tariff announcements had introduced "additional uncertainty" into the economic projections.\n\nThe summary of economic projections released alongside the decision showed median forecasts for core PCE inflation rising to 2.8% in 2026, up from 2.5% in the December projections. Twelve of nineteen policymakers said they expected at least two rate cuts this year, while four projected one or fewer.\n\nMarkets reacted positively, with the S&P 500 closing 1.1% higher and the yield on the 10-year Treasury note falling to 4.27%. Analysts at Goldman Sachs said in a note that the decision was "broadly in line with consensus" and continued to forecast a first cut in June.`,
  },
  {
    id: "whatsapp-cure",
    category: "fake",
    title: "SHOCKING!! Doctors HATE this one weird trick that CURES diabetes overnight — share before they delete it!!",
    source: "WhatsApp-style forward",
    note: "Classic forwarding pattern: ALL CAPS, exclamation pressure, urgency, no sourcing.",
    body: `BREAKING!! Big Pharma DOES NOT want you to know about this MIRACLE cure that scientists are calling 100% guaranteed!!\n\nA SECRET hidden compound found in your kitchen has been EXPOSED to reverse type 2 diabetes INSTANTLY — and the deep state has been WEAPONIZING the medical cabal to suppress it for decades. WAKE UP, sheeple!!\n\nWatch the video below before THEY take it down. Doctors are stunned. Patients have thrown away their insulin. The globalist agenda is crumbling. SHARE this with everyone you love before it disappears forever!!\n\nThis is the bombshell the elite never wanted you to see. You won't believe what happens at minute 3:42. MUST WATCH!!`,
  },
  {
    id: "ap-storm",
    category: "real",
    title: "At least 12 dead as severe storms sweep across central United States",
    source: "Associated-Press style wire",
    note: "Casualty reporting with named officials, agencies, geography, and timeline.",
    body: `KANSAS CITY, Mo. — At least 12 people have been killed and dozens injured after a line of severe thunderstorms swept across the central United States overnight, spawning multiple tornadoes and widespread power outages, officials said on Friday.\n\nMissouri Governor Mike Kehoe declared a state of emergency in 14 counties and authorized the deployment of the National Guard to assist with search-and-rescue operations. The National Weather Service confirmed at least seven tornadoes had touched down between Wednesday evening and Thursday morning.\n\nAccording to the Federal Emergency Management Agency, more than 320,000 customers across Missouri, Arkansas, and Tennessee remained without power as of 6 a.m. local time. Spokesperson Maria Hernandez told reporters that mutual-aid crews from neighbouring states had been mobilized.\n\n"This was one of the most violent overnight outbreaks we have seen this season," said NWS meteorologist David Lin. The agency said it would continue to survey damage paths through the weekend to confirm the strength of each tornado on the Enhanced Fujita scale.`,
  },
  {
    id: "borderline-vaccine",
    category: "borderline",
    title: "New study suggests common vaccine may be linked to surprising health benefit",
    source: "Aggregator blog",
    note: "Hedged headline, mid-quality sourcing — designed to flip under paraphrase.",
    body: `A new study published this week suggests that a widely administered vaccine may carry an unexpected secondary benefit, researchers reportedly said. The findings, which have not yet been independently replicated, were described in a preprint that has begun to circulate online.\n\nThe lead author, an unnamed researcher affiliated with a European university, said the team had analysed retrospective data covering several thousand patients. Critics, however, cautioned that the design was observational and that confounders had not been fully addressed.\n\nSeveral commentators on social media seized on the findings as evidence that mainstream guidance had been incomplete, while others urged readers to await peer review. The original preprint did not include effect sizes in its abstract.`,
  },
];

export const SEEDED_RUNS = [
  {
    id: "run-001",
    title: "Federal Reserve holds interest rates steady...",
    label: "REAL" as const,
    probability: 0.021,
    robustness: "STABLE" as const,
    timestamp: "2 min ago",
  },
  {
    id: "run-002",
    title: "SHOCKING!! Doctors HATE this one weird trick...",
    label: "FAKE" as const,
    probability: 0.991,
    robustness: "STABLE" as const,
    timestamp: "8 min ago",
  },
  {
    id: "run-003",
    title: "New study suggests common vaccine may be linked...",
    label: "FAKE" as const,
    probability: 0.612,
    robustness: "FLIPPED" as const,
    timestamp: "14 min ago",
  },
  {
    id: "run-004",
    title: "At least 12 dead as severe storms sweep across...",
    label: "REAL" as const,
    probability: 0.034,
    robustness: "STABLE" as const,
    timestamp: "27 min ago",
  },
];
