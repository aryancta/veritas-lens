export function ArchitectureDiagram() {
  return (
    <div className="rounded-xl border bg-background p-4 overflow-x-auto">
      <svg
        viewBox="0 0 900 360"
        className="w-full h-auto min-w-[680px]"
        role="img"
        aria-label="Veritas Lens architecture diagram"
      >
        <defs>
          <linearGradient id="g-deberta" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(230,70%,56%)" />
            <stop offset="100%" stopColor="hsl(260,70%,55%)" />
          </linearGradient>
          <linearGradient id="g-llm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(280,70%,55%)" />
            <stop offset="100%" stopColor="hsl(330,75%,55%)" />
          </linearGradient>
          <linearGradient id="g-audit" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(35,90%,55%)" />
            <stop offset="100%" stopColor="hsl(15,80%,55%)" />
          </linearGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(220,9%,46%)" />
          </marker>
        </defs>

        <Block x={20} y={140} w={150} h={70} fill="hsl(var(--muted))" stroke="hsl(var(--border))"
          title="User input" subtitle="Headline + body" />

        <Block x={210} y={20} w={170} h={70} fill="url(#g-deberta)" stroke="transparent"
          title="DeBERTa-v3 ensemble" subtitle="5-fold · isotonic-calibrated" titleColor="white" subtitleColor="rgba(255,255,255,0.85)" />

        <Block x={210} y={140} w={170} h={70} fill="hsl(var(--card))" stroke="hsl(var(--border))"
          title="Saliency aggregator" subtitle="SHAP · top-K phrases" />

        <Block x={210} y={260} w={170} h={70} fill="url(#g-audit)" stroke="transparent"
          title="Paraphrase auditor" subtitle="LLM rewrite + reclassify" titleColor="white" subtitleColor="rgba(255,255,255,0.9)" />

        <Block x={430} y={80} w={170} h={70} fill="url(#g-llm)" stroke="transparent"
          title="L-Defense LLM" subtitle="Argues REAL vs FAKE" titleColor="white" subtitleColor="rgba(255,255,255,0.9)" />

        <Block x={430} y={200} w={170} h={70} fill="hsl(var(--card))" stroke="hsl(var(--border))"
          title="Robustness verdict" subtitle="STABLE · DRIFTED · FLIPPED" />

        <Block x={650} y={20} w={220} h={310} fill="hsl(var(--card))" stroke="hsl(var(--border))"
          title="Veritas Lens UI" subtitle="Verdict · highlights · debate · audit" />

        <Edge x1={170} y1={175} x2={210} y2={55} />
        <Edge x1={170} y1={175} x2={210} y2={175} />
        <Edge x1={170} y1={175} x2={210} y2={295} />
        <Edge x1={380} y1={55} x2={430} y2={115} />
        <Edge x1={380} y1={175} x2={430} y2={115} />
        <Edge x1={380} y1={295} x2={430} y2={235} />
        <Edge x1={600} y1={115} x2={650} y2={120} />
        <Edge x1={600} y1={235} x2={650} y2={210} />
      </svg>
    </div>
  );
}

function Block({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  title,
  subtitle,
  titleColor,
  subtitleColor,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  title: string;
  subtitle: string;
  titleColor?: string;
  subtitleColor?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={1} />
      <text
        x={x + w / 2}
        y={y + h / 2 - 4}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill={titleColor ?? "hsl(var(--foreground))"}
      >
        {title}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 14}
        textAnchor="middle"
        fontSize={11}
        fill={subtitleColor ?? "hsl(var(--muted-foreground))"}
      >
        {subtitle}
      </text>
    </g>
  );
}

function Edge({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="hsl(220,9%,46%)"
      strokeWidth={1.5}
      markerEnd="url(#arrow)"
    />
  );
}
