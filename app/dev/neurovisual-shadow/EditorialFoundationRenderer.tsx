"use client";

import { Check, X } from "lucide-react";
import {
  CentralConceptOrbit,
  DecisionFunnel,
  EditorialCanvas,
  EditorialDeck,
  EditorialSticker,
  HeadlineLockup,
  KeywordRibbon,
  MnemonicStrip,
} from "@/components/slides/editorial";
import { NursingIcon } from "@/components/slides/editorial/icons/NursingIcons";
import type {
  EditorialAtomicFact,
  RuntimeEditorialSynthesis,
  SlideType,
} from "@/lib/neurovisualShadow/model";
import { cn } from "@/lib/utils";
import { PrenatalEditorialFoundation } from "./PrenatalEditorialFoundation";

type Tone = "sky" | "teal" | "amber" | "rose" | "ink";

const factTone: Record<EditorialAtomicFact["tone"], Tone> = {
  success: "teal",
  danger: "rose",
  warning: "amber",
  info: "sky",
  neutral: "ink",
};

const toneClass: Record<Tone, string> = {
  sky: "border-sky-500 bg-sky-100 text-sky-950",
  teal: "border-teal-500 bg-teal-100 text-teal-950",
  amber: "border-amber-400 bg-amber-100 text-amber-950",
  rose: "border-rose-500 bg-rose-100 text-rose-950",
  ink: "border-slate-700 bg-slate-100 text-slate-950",
};

function coloredHeadline(text: string, tones: Tone[]) {
  return text.split(/\s+/).map((word, index) => ({
    text: word,
    tone: tones[index % tones.length],
  }));
}

function factText(fact: EditorialAtomicFact): string {
  return fact.condition?.text ?? fact.opposition?.text ?? fact.value?.text ?? "";
}

function OrbitFact({ fact }: { fact: EditorialAtomicFact }) {
  const visualTone = factTone[fact.tone];
  return (
    <div
      className={cn(
        "relative z-10 min-w-0 rounded-xl border-2 p-1.5 shadow-[2px_2px_0_rgba(15,23,42,0.14)] min-[620px]:p-2",
        toneClass[visualTone],
      )}
      data-aa-contrast
    >
      <div className="flex items-center gap-1">
        {fact.icon_id ? (
          <NursingIcon icon={fact.icon_id} className="h-5 w-5 shrink-0 min-[620px]:h-7 min-[620px]:w-7" />
        ) : null}
        <p className="font-display text-[8px] font-black uppercase leading-none min-[620px]:text-xs">
          {fact.label.text}
        </p>
      </div>
      {fact.value ? (
        <p className="mt-1 font-display text-xl font-black leading-none min-[620px]:text-3xl">
          {fact.value.text} <span className="text-[0.55em]">{fact.unit?.text}</span>
        </p>
      ) : null}
      <p className="mt-1 font-body text-[8.5px] font-bold leading-tight min-[620px]:text-[11px]">
        {factText(fact)}
      </p>
    </div>
  );
}

function HumanizedFocusPoster({ synthesis }: { synthesis: RuntimeEditorialSynthesis }) {
  return (
    <EditorialCanvas tone="teal" className="bg-[linear-gradient(145deg,#cffafe_0%,#ecfdf5_48%,#fef3c7_100%)]">
      <HeadlineLockup
        kicker="mapa integrado · cuidado centrado na pessoa"
        segments={coloredHeadline(synthesis.headline.text, ["teal", "sky", "amber"])}
        compact
      />
      <KeywordRibbon
        keywords={synthesis.keywords.map((keyword, index) => ({
          text: keyword.text,
          tone: (["sky", "teal", "amber", "rose"] as Tone[])[index % 4],
        }))}
      />
      <CentralConceptOrbit
        center={
          <div className="flex aspect-square items-center justify-center rounded-full border-[5px] border-white bg-teal-700 p-2 text-center text-white shadow-[5px_5px_0_rgba(15,23,42,0.18)]" data-aa-contrast>
            <div>
              <NursingIcon icon="companion" className="mx-auto h-8 w-8 min-[620px]:h-11 min-[620px]:w-11" />
              <p className="mt-1 font-display text-[11px] font-black uppercase leading-[0.9] min-[620px]:text-xl">
                {synthesis.dominant_fact?.text}
              </p>
            </div>
          </div>
        }
      >
        {synthesis.facts.map((fact) => <OrbitFact key={fact.fact_id} fact={fact} />)}
      </CentralConceptOrbit>
      {synthesis.warning ? (
        <div className="mb-1 text-center"><EditorialSticker tone="rose">{synthesis.warning.text}</EditorialSticker></div>
      ) : null}
      {synthesis.mnemonic ? <MnemonicStrip tone="teal">{synthesis.mnemonic.text}</MnemonicStrip> : null}
    </EditorialCanvas>
  );
}

function AssertionCard({ fact }: { fact: EditorialAtomicFact }) {
  const isCorrect = fact.tone === "success";
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border-2 p-1.5 shadow-sm min-[620px]:p-2",
        isCorrect ? "border-teal-500 bg-teal-100" : "border-rose-500 bg-rose-100",
      )}
      data-testid={`parto-assertion-${fact.label.text.toLowerCase()}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-display text-2xl font-black leading-none text-slate-950 min-[620px]:text-4xl">{fact.label.text}</span>
        <span className={cn("flex items-center gap-1 font-mono text-[8px] font-black uppercase min-[620px]:text-[10px]", isCorrect ? "text-teal-800" : "text-rose-800")}>
          {isCorrect ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4 stroke-[3]" />}
          {fact.value?.text}
        </span>
      </div>
      <p className="mt-1 font-body text-[9px] font-black leading-tight text-slate-900 min-[620px]:text-xs">{fact.condition?.text}</p>
      {fact.opposition ? (
        <p className="mt-1 border-t border-current/20 pt-1 font-mono text-[7.5px] font-black uppercase leading-tight text-teal-800 min-[620px]:text-[9px]">
          Correção: {fact.opposition.text}
        </p>
      ) : null}
    </div>
  );
}

function DecisionFunnelPoster({ synthesis }: { synthesis: RuntimeEditorialSynthesis }) {
  const assertions = synthesis.facts.slice(0, 4);
  const answer = synthesis.facts[4];
  return (
    <EditorialCanvas tone="sky" className="bg-[linear-gradient(150deg,#e0f2fe_0%,#fff7ed_50%,#d1fae5_100%)]">
      <HeadlineLockup
        kicker="funil de decisão · quatro afirmações abertas"
        segments={coloredHeadline(synthesis.headline.text, ["sky", "rose", "teal", "amber"])}
        compact
      />
      <div className="mt-1.5 min-h-0 flex-1">
        <DecisionFunnel
          result={
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-3 py-1 text-left text-slate-950 shadow-[3px_3px_0_rgba(15,23,42,0.16)]" data-testid="parto-answer-destination" data-aa-contrast>
              <div className="text-center">
                <p className="font-mono text-[6px] font-black uppercase tracking-widest">{answer?.label.text}</p>
                <p className="font-display text-2xl font-black leading-[0.8] min-[620px]:text-4xl">{answer?.value?.text}</p>
              </div>
              <div>
                <p className="font-body text-[8px] font-black uppercase min-[620px]:text-xs">{answer?.condition?.text}</p>
                {synthesis.warning ? <p className="font-mono text-[6px] font-black uppercase text-rose-900 min-[620px]:text-[8px]">{synthesis.warning.text}</p> : null}
              </div>
            </div>
          }
        >
          {assertions.map((fact) => <AssertionCard key={fact.fact_id} fact={fact} />)}
        </DecisionFunnel>
      </div>
      {synthesis.mnemonic ? <MnemonicStrip tone="ink">{synthesis.mnemonic.text}</MnemonicStrip> : null}
    </EditorialCanvas>
  );
}

function PracticeDeckPoster({ synthesis }: { synthesis: RuntimeEditorialSynthesis }) {
  return (
    <EditorialCanvas tone="amber" className="bg-[linear-gradient(145deg,#fef3c7_0%,#ecfdf5_48%,#e0f2fe_100%)]">
      <HeadlineLockup
        kicker="regra de ouro · práticas que pertencem ao mesmo cuidado"
        segments={coloredHeadline(synthesis.headline.text, ["amber", "teal", "sky", "rose"])}
        compact
      />
      <div className="my-1.5 flex items-center justify-between gap-2">
        <EditorialSticker tone="teal">{synthesis.dominant_fact?.text}</EditorialSticker>
        {synthesis.warning ? <span className="font-mono text-[7px] font-black uppercase text-rose-800 min-[620px]:text-[9px]">{synthesis.warning.text}</span> : null}
      </div>
      <EditorialDeck>
        {synthesis.facts.map((fact) => {
          const visualTone = factTone[fact.tone];
          return (
            <div key={fact.fact_id} className={cn("min-w-0 rounded-xl border-2 p-1.5 shadow-sm min-[620px]:p-2", toneClass[visualTone])} data-testid={`parto-practice-${fact.fact_id}`} data-aa-contrast>
              <div className="flex items-center gap-1.5">
                {fact.icon_id ? <NursingIcon icon={fact.icon_id} className="h-5 w-5 shrink-0 min-[620px]:h-7 min-[620px]:w-7" /> : null}
                <p className="font-display text-[9px] font-black uppercase leading-tight min-[620px]:text-xs">{fact.label.text}</p>
              </div>
              {fact.value ? <p className="mt-0.5 font-display text-xl font-black leading-none min-[620px]:mt-1 min-[620px]:text-3xl">{fact.value.text} <span className="text-[0.55em]">{fact.unit?.text}</span></p> : null}
              <p className="mt-0.5 font-body text-[7.5px] font-bold leading-tight min-[620px]:mt-1 min-[620px]:text-[11px]">{fact.condition?.text}</p>
            </div>
          );
        })}
      </EditorialDeck>
      {synthesis.mnemonic ? <MnemonicStrip tone="teal">{synthesis.mnemonic.text}</MnemonicStrip> : null}
    </EditorialCanvas>
  );
}

export function EditorialFoundationRenderer({
  slideType,
  compositionId,
  synthesis,
}: {
  slideType: SlideType;
  compositionId: string;
  synthesis: RuntimeEditorialSynthesis;
}) {
  const gesture = compositionId.split(".").at(-1);
  if (slideType === "concept_map" && gesture === "focus") return <HumanizedFocusPoster synthesis={synthesis} />;
  if (slideType === "logic_flow" && synthesis.art_direction.direction === "filtering") return <DecisionFunnelPoster synthesis={synthesis} />;
  if (slideType === "golden_rule" && synthesis.art_direction.direction === "equivalent_units") return <PracticeDeckPoster synthesis={synthesis} />;
  return (
    <PrenatalEditorialFoundation
      slideType={slideType}
      synthesis={synthesis}
      compactCompare={synthesis.art_direction.direction === "paired_rows_compact"}
    />
  );
}
