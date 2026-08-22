import {
  ArrowPath,
  ContrastPair,
  EditorialCanvas,
  EditorialSticker,
  HeadlineLockup,
  IconFact,
  KeywordRibbon,
  MnemonicStrip,
  NumberHero,
  TimelineSpine,
  WrongRightLockup,
  NursingIcon,
} from "@/components/slides/editorial";
import type {
  EditorialAtomicFact,
  RuntimeEditorialSynthesis,
  SlideType,
} from "@/lib/neurovisualShadow/model";
import { cn } from "@/lib/utils";

type Tone = "sky" | "teal" | "amber" | "rose" | "ink";

const factTone: Record<EditorialAtomicFact["tone"], Tone> = {
  success: "teal",
  danger: "rose",
  warning: "amber",
  info: "sky",
  neutral: "ink",
};

function colorHeadlineWords(text: string, tones: Tone[]) {
  return text.split(" ").map((word, index) => ({
    text: word,
    tone: tones[Math.min(index, tones.length - 1)],
  }));
}

function DecisionText({
  text,
  tone,
}: {
  text: string;
  tone: "wrong" | "right";
}) {
  const parts = text.split(/(tabagismo|fator de risco|verdadeiras?|falsa)/gi);
  const decisive = /^(tabagismo|fator de risco|verdadeiras?|falsa)$/i;
  return (
    <>
      {parts.map((part, index) =>
        decisive.test(part) ? (
          <strong
            key={`${part}-${index}`}
            className={cn(
              "rounded-sm px-0.5 font-black underline decoration-2 underline-offset-2",
              tone === "wrong"
                ? "bg-rose-200 text-rose-950 decoration-rose-600"
                : "bg-emerald-200 text-emerald-950 decoration-emerald-600",
            )}
          >
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function factBody(fact: EditorialAtomicFact): string {
  if (fact.opposition && fact.condition)
    return `${fact.opposition.text} · ${fact.condition.text}`;
  if (fact.opposition && fact.exception)
    return `${fact.opposition.text} · ${fact.exception.text}`;
  return (
    fact.condition?.text ?? fact.opposition?.text ?? fact.exception?.text ?? ""
  );
}

function factNumber(fact: EditorialAtomicFact): {
  value: string;
  unit: string;
} {
  return { value: fact.value?.text ?? "", unit: fact.unit?.text ?? "" };
}

function ConceptPoster({
  synthesis,
}: {
  synthesis: RuntimeEditorialSynthesis;
}) {
  const stationColors = [
    "bg-amber-100 ring-amber-300",
    "bg-sky-100 ring-sky-300",
    "bg-teal-100 ring-teal-300",
    "bg-rose-100 ring-rose-300",
  ];
  const stationNodeColors = [
    "bg-amber-300 text-slate-950",
    "bg-sky-700",
    "bg-teal-700",
    "bg-rose-600",
  ];
  return (
    <EditorialCanvas
      tone="sky"
      className="bg-[linear-gradient(145deg,#ecfeff_0%,#fff7ed_48%,#d1fae5_100%)]"
    >
      <HeadlineLockup
        kicker="mapa integrado · trilho gestacional"
        segments={colorHeadlineWords(synthesis.headline.text, [
          "sky",
          "amber",
          "teal",
        ])}
      />
      <KeywordRibbon
        keywords={synthesis.keywords.map((keyword, index) => ({
          text: keyword.text,
          tone: (["sky", "teal", "rose"] as Tone[])[index % 3],
        }))}
      />
      <div className="mt-2 grid grid-cols-[1fr_6.5rem] items-center gap-2 rounded-xl bg-white/75 p-2 shadow-sm ring-1 ring-inset ring-sky-200 min-[620px]:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-700 text-white shadow-md min-[620px]:h-16 min-[620px]:w-16">
            <NursingIcon
              icon="prenatal"
              className="h-8 w-8 min-[620px]:h-11 min-[620px]:w-11"
              label="Gestação"
            />
          </span>
          <div>
            <p
              className="inline-block rounded-lg bg-amber-300 px-2 py-1 font-display text-[1.7rem] font-black leading-none tracking-[-0.07em] text-slate-950 shadow-sm min-[620px]:text-5xl"
              data-aa-contrast
            >
              {synthesis.dominant_fact?.text}
            </p>
            <p className="font-mono text-[8px] font-black uppercase tracking-[0.17em] text-slate-600">
              marco que inicia o percurso
            </p>
          </div>
        </div>
        {synthesis.warning ? (
          <EditorialSticker
            tone="rose"
            className="max-w-[6.5rem] text-[8px] min-[620px]:max-w-[15rem] min-[620px]:text-sm"
          >
            {synthesis.warning.text}
          </EditorialSticker>
        ) : null}
      </div>
      <TimelineSpine>
        {synthesis.facts.map((fact, index) => (
          <div
            key={fact.fact_id}
            className={cn(
              "relative z-10 grid min-w-0 grid-cols-[1.7rem_1fr] items-center rounded-xl px-1 py-1 text-left shadow-sm ring-1 ring-inset min-[620px]:flex min-[620px]:flex-col min-[620px]:px-1.5 min-[620px]:py-1.5 min-[620px]:text-center",
              stationColors[index],
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-[#fffdf8] text-white shadow-md min-[620px]:h-10 min-[620px]:w-10 min-[620px]:border-[3px]",
                stationNodeColors[index],
              )}
              data-aa-contrast
            >
              {fact.icon_id ? (
                <NursingIcon
                  icon={fact.icon_id}
                  className="h-4 w-4 min-[620px]:h-6 min-[620px]:w-6"
                />
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0 min-[620px]:contents">
              <p className="font-display text-[9.5px] font-black uppercase leading-tight text-slate-950 min-[620px]:mt-1 min-[620px]:text-xs">
                {fact.label.text}
              </p>
              <p className="mt-0.5 font-body text-[9.5px] font-bold leading-tight text-slate-800 min-[620px]:max-w-[8.5rem] min-[620px]:text-[11px]">
                {factBody(fact)}
              </p>
            </div>
          </div>
        ))}
      </TimelineSpine>
      {synthesis.mnemonic ? (
        <MnemonicStrip tone="teal">{synthesis.mnemonic.text}</MnemonicStrip>
      ) : null}
    </EditorialCanvas>
  );
}

function LogicPoster({ synthesis }: { synthesis: RuntimeEditorialSynthesis }) {
  const assertions = synthesis.facts.slice(0, 3);
  const result = synthesis.facts.at(-1);
  return (
    <EditorialCanvas
      tone="teal"
      className="bg-[linear-gradient(145deg,#dff8ff_0%,#ecfdf5_48%,#fff1f2_100%)]"
    >
      <HeadlineLockup
        kicker="raciocínio completo · nenhuma etapa oculta"
        segments={colorHeadlineWords(synthesis.headline.text, [
          "sky",
          "sky",
          "teal",
          "teal",
          "rose",
          "rose",
        ])}
        compact
      />
      <KeywordRibbon
        keywords={synthesis.keywords.map((keyword, index) => ({
          text: keyword.text,
          tone: (["sky", "teal", "rose", "amber"] as Tone[])[index % 4],
        }))}
      />
      <div className="mt-2 grid grid-cols-3 gap-1.5 min-[620px]:gap-3">
        {assertions.map((fact, index) => (
          <div
            key={fact.fact_id}
            className={cn(
              "relative rounded-lg border-t-[5px] p-1.5 shadow-sm",
              fact.tone === "danger"
                ? "border-rose-600 bg-rose-100"
                : index === 0
                  ? "border-sky-600 bg-sky-100"
                  : "border-teal-600 bg-teal-100",
            )}
            data-testid={`logic-assertion-${fact.label.text.toLowerCase()}`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="font-display text-3xl font-black leading-none text-slate-950 min-[620px]:text-4xl">
                {fact.label.text}
              </span>
              {fact.icon_id ? (
                <NursingIcon
                  icon={fact.icon_id}
                  className={cn(
                    "h-6 w-6 min-[620px]:h-8 min-[620px]:w-8",
                    fact.tone === "danger"
                      ? "text-rose-800"
                      : index === 0
                        ? "text-sky-800"
                        : "text-teal-800",
                  )}
                />
              ) : null}
            </div>
            <p
              className={cn(
                "mt-1 font-mono text-[9px] font-black uppercase tracking-wide min-[620px]:text-[10px]",
                fact.tone === "danger" ? "text-rose-800" : "text-teal-800",
              )}
            >
              {fact.value?.text}
            </p>
            <p className="mt-1 font-body text-[10px] font-bold leading-tight text-slate-700 min-[620px]:text-xs">
              {fact.condition?.text ?? factBody(fact)}
            </p>
          </div>
        ))}
      </div>
      <div className="my-1.5">
        <ArrowPath
          labels={assertions.map(
            (fact) => `${fact.label.text} ${fact.value?.text ?? ""}`,
          )}
          tones={["sky", "teal", "rose"]}
        />
      </div>
      <div className="mt-1 grid min-h-0 shrink-0 grid-cols-[1.25fr_0.75fr] items-stretch gap-2 min-[620px]:gap-3">
        {synthesis.contrast_pairs[0] ? (
          <div
            className="flex min-w-0 flex-col justify-center rounded-xl bg-rose-100 p-1.5 shadow-sm ring-1 ring-inset ring-rose-300"
            data-testid="logic-risk-equation"
          >
            <p className="font-mono text-[8px] font-black uppercase tracking-[0.14em] text-rose-800">
              a afirmativa III cai porque
            </p>
            <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-center font-display text-[11px] font-black uppercase leading-tight text-rose-950 min-[620px]:text-sm">
              <span>{synthesis.contrast_pairs[0].left.text.split(" ")[0]}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-slate-950">
                =
              </span>
              <span>
                {assertions[2]?.opposition?.text ??
                  synthesis.contrast_pairs[0].right.text}
              </span>
            </div>
          </div>
        ) : (
          <span />
        )}
        <div
          className="flex min-w-0 flex-col items-center justify-center rounded-xl bg-amber-300 p-1.5 text-center text-slate-950 shadow-[3px_3px_0_rgba(15,23,42,0.16)]"
          data-testid="logic-answer-destination"
          data-aa-contrast
        >
          <p className="font-mono text-[7px] font-black uppercase tracking-[0.14em] min-[620px]:text-[8px]">
            conjunto verdadeiro
          </p>
          <p className="font-display text-5xl font-black leading-[0.8] tracking-[-0.08em] min-[620px]:text-6xl">
            {result?.value?.text}
          </p>
          <p className="mt-1 font-body text-[9px] font-black uppercase leading-tight min-[620px]:text-xs">
            {result?.condition?.text}
          </p>
        </div>
      </div>
      {synthesis.mnemonic ? (
        <div
          className="mt-1.5 shrink-0 [&>div]:mt-0 [&>div]:py-1.5"
          data-testid="logic-formula"
        >
          <MnemonicStrip tone="ink">{synthesis.mnemonic.text}</MnemonicStrip>
        </div>
      ) : null}
    </EditorialCanvas>
  );
}

function GoldenPoster({ synthesis }: { synthesis: RuntimeEditorialSynthesis }) {
  const first = synthesis.facts[0];
  const consultations = synthesis.facts[1];
  const ttgo = synthesis.facts[2];
  const secondary = synthesis.facts.slice(3);
  return (
    <EditorialCanvas
      tone="amber"
      className="bg-[linear-gradient(150deg,#fff7cc_0%,#ecfeff_48%,#d1fae5_100%)]"
    >
      <HeadlineLockup
        kicker="regra de ouro · números que mudam a conduta"
        segments={colorHeadlineWords(synthesis.headline.text, [
          "sky",
          "amber",
          "rose",
        ])}
        compact
      />
      <div className="mt-1.5 grid grid-cols-[0.8fr_1.2fr] items-center gap-3 min-[620px]:mt-2 min-[620px]:grid-cols-[0.92fr_1.08fr] min-[620px]:gap-6">
        <div data-testid="golden-first-consultation">
          <NumberHero
            {...factNumber(first)}
            label={`${first.label.text} · ${first.condition?.text ?? ""}`}
            tone="sky"
          />
        </div>
        <div className="space-y-1 border-l-2 border-slate-300 pl-3 min-[620px]:space-y-2">
          <div
            className="rounded-lg bg-teal-50 p-1 ring-1 ring-inset ring-teal-200 min-[620px]:p-1.5"
            data-testid="golden-minimum-consultations"
          >
            <NumberHero
              {...factNumber(consultations)}
              label={consultations.label.text}
              tone="teal"
              size="support"
            />
            {synthesis.contrast_pairs[0] ? (
              <div className="mt-1" data-testid="golden-minimum-contrast">
                <ContrastPair
                  left={synthesis.contrast_pairs[0].left.text}
                  right={synthesis.contrast_pairs[0].right.text}
                  compact
                />
              </div>
            ) : null}
          </div>
          <div data-testid="golden-ttgo-window">
            <NumberHero
              {...factNumber(ttgo)}
              label={ttgo.label.text}
              tone="amber"
              size="support"
            />
          </div>
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 min-[620px]:mt-2 min-[620px]:gap-3">
        {secondary.map((fact) => (
          <div key={fact.fact_id} data-testid={`golden-${fact.fact_id}`}>
            <IconFact
              icon={fact.icon_id ?? "prenatal"}
              label={fact.label.text}
              body={factBody(fact)}
              tone={factTone[fact.tone]}
              className="p-1.5 min-[620px]:p-2"
            />
          </div>
        ))}
      </div>
      {synthesis.mnemonic ? (
        <MnemonicStrip tone="amber">{synthesis.mnemonic.text}</MnemonicStrip>
      ) : null}
    </EditorialCanvas>
  );
}

function DangerPoster({
  synthesis,
  compact = false,
}: {
  synthesis: RuntimeEditorialSynthesis;
  compact?: boolean;
}) {
  return (
    <EditorialCanvas
      tone="rose"
      className="bg-[linear-gradient(145deg,#ffe4e6_0%,#fff7ed_46%,#d1fae5_100%)]"
    >
      <div className="flex items-start justify-between gap-2">
        <HeadlineLockup
          kicker="zona de perigo · erro e correção simultâneos"
          segments={colorHeadlineWords(synthesis.headline.text, [
            "rose",
            "amber",
            "rose",
          ])}
          compact
        />
        {synthesis.dominant_fact ? (
          <EditorialSticker tone="rose">
            {synthesis.dominant_fact.text}
          </EditorialSticker>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-[1.55rem_1fr] gap-1 font-mono text-[7px] font-black uppercase tracking-[0.1em] min-[620px]:hidden">
        <span
          className="flex items-center justify-center rounded-md bg-slate-950 px-1 py-1 text-white"
          data-aa-contrast
        >
          letra
        </span>
        <span className="rounded-md bg-[linear-gradient(90deg,#e11d48_0%,#e11d48_43%,#fcd34d_43%,#fcd34d_57%,#047857_57%,#047857_100%)] px-1.5 py-1 text-center text-white shadow-sm">
          erro&nbsp;&nbsp; → &nbsp;&nbsp;correção
        </span>
      </div>
      <div className="mt-2 hidden grid-cols-[2rem_1fr_1.65rem_1fr] items-stretch gap-1.5 font-mono text-[9px] font-black uppercase tracking-[0.1em] min-[620px]:grid">
        <span
          className="flex items-center justify-center rounded-md bg-slate-950 px-1 py-1 text-white"
          data-aa-contrast
        >
          letra
        </span>
        <span
          className="rounded-md bg-rose-600 px-1.5 py-1 text-center text-white"
          data-aa-contrast
        >
          por que cai
        </span>
        <span
          className="rounded-md bg-amber-300 px-1 py-1 text-center text-slate-950"
          aria-hidden
        >
          →
        </span>
        <span
          className="rounded-md bg-emerald-700 px-1.5 py-1 text-center text-white"
          data-aa-contrast
        >
          correção
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {synthesis.facts.map((fact) => (
          <WrongRightLockup
            key={fact.fact_id}
            label={fact.label.text}
            compact={compact}
            wrong={
              <DecisionText text={fact.opposition?.text ?? ""} tone="wrong" />
            }
            right={
              <DecisionText text={fact.condition?.text ?? ""} tone="right" />
            }
          />
        ))}
      </div>
      {synthesis.warning ? (
        <p
          className="mb-1 rotate-[-1deg] bg-amber-300 px-2 py-1 text-center font-display text-xs font-black uppercase text-slate-950 shadow-sm min-[620px]:text-sm"
          data-aa-contrast
        >
          {synthesis.warning.text}
        </p>
      ) : null}
      {synthesis.mnemonic ? (
        <MnemonicStrip>{synthesis.mnemonic.text}</MnemonicStrip>
      ) : null}
    </EditorialCanvas>
  );
}

export function PrenatalEditorialFoundation({
  slideType,
  synthesis,
  compactCompare = false,
}: {
  slideType: SlideType;
  synthesis: RuntimeEditorialSynthesis;
  compactCompare?: boolean;
}) {
  if (slideType === "concept_map")
    return <ConceptPoster synthesis={synthesis} />;
  if (slideType === "logic_flow") return <LogicPoster synthesis={synthesis} />;
  if (slideType === "golden_rule")
    return <GoldenPoster synthesis={synthesis} />;
  return <DangerPoster synthesis={synthesis} compact={compactCompare} />;
}
