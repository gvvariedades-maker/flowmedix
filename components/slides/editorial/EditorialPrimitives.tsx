import type { ReactNode } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NursingIcon, type NursingIconId } from "./icons/NursingIcons";

type Tone = "sky" | "teal" | "amber" | "rose" | "ink";

const tone = {
  sky: {
    bg: "bg-sky-700",
    soft: "bg-sky-100",
    text: "text-sky-800",
    border: "border-sky-600",
    onSolid: "text-white",
  },
  teal: {
    bg: "bg-teal-700",
    soft: "bg-teal-100",
    text: "text-teal-800",
    border: "border-teal-600",
    onSolid: "text-white",
  },
  amber: {
    bg: "bg-amber-300",
    soft: "bg-amber-100",
    text: "text-amber-900",
    border: "border-amber-500",
    onSolid: "text-slate-950",
  },
  rose: {
    bg: "bg-rose-600",
    soft: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-600",
    onSolid: "text-white",
  },
  ink: {
    bg: "bg-slate-950",
    soft: "bg-slate-200",
    text: "text-slate-950",
    border: "border-slate-950",
    onSolid: "text-white",
  },
} as const;

export function EditorialCanvas({
  children,
  tone: canvasTone = "sky",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border-[3px] bg-[#fffdf8] shadow-2xl min-[620px]:aspect-[4/3]",
        tone[canvasTone].border,
        className,
      )}
      data-editorial-canvas
      data-internal-scroll="false"
    >
      <div
        className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-200/55 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-amber-200/55 blur-2xl"
        aria-hidden
      />
      <div
        className={cn(
          "absolute right-3 top-16 h-9 w-28 rotate-[-6deg] opacity-[0.12]",
          tone[canvasTone].bg,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "absolute bottom-14 left-3 h-8 w-24 rotate-[6deg] opacity-[0.12]",
          tone[canvasTone].bg,
        )}
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col p-4 min-[620px]:p-5">
        {children}
      </div>
    </div>
  );
}

export function HeadlineLockup({
  kicker,
  segments,
  compact = false,
}: {
  kicker: string;
  segments: Array<{ text: string; tone?: Tone }>;
  compact?: boolean;
}) {
  return (
    <header>
      <p className="font-mono text-[8px] font-black uppercase tracking-[0.22em] text-slate-600 min-[620px]:text-[9px]">
        {kicker}
      </p>
      <h2
        className={cn(
          "mt-1 max-w-[95%] font-display font-black uppercase leading-[0.86] tracking-[-0.065em] text-slate-950",
          compact
            ? "text-[1.45rem] min-[620px]:text-[2.4rem]"
            : "text-[2rem] min-[620px]:text-[3.35rem]",
        )}
      >
        {segments.map((segment, index) => (
          <span
            key={`${segment.text}-${index}`}
            className={cn(segment.tone && tone[segment.tone].text)}
          >
            {segment.text}
            {index < segments.length - 1 ? " " : ""}
          </span>
        ))}
      </h2>
    </header>
  );
}

export function KeywordRibbon({
  keywords,
}: {
  keywords: Array<{ text: string; tone: Tone }>;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Palavras-chave">
      {keywords.map((keyword) => (
        <span
          key={keyword.text}
          className={cn(
            "skew-x-[-5deg] px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.06em] shadow-[2px_2px_0_rgba(15,23,42,0.18)] min-[620px]:text-[10px]",
            tone[keyword.tone].bg,
            tone[keyword.tone].onSolid,
          )}
          data-aa-contrast
        >
          <span className="inline-block skew-x-[5deg]">{keyword.text}</span>
        </span>
      ))}
    </div>
  );
}

export function NumberHero({
  value,
  unit,
  label,
  tone: numberTone = "sky",
  size = "hero",
}: {
  value: string;
  unit: string;
  label: string;
  tone?: Tone;
  size?: "hero" | "support";
}) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 gap-1.5",
        size === "support"
          ? "flex-col items-start gap-0 min-[620px]:flex-row min-[620px]:items-end min-[620px]:gap-1.5"
          : "items-end",
      )}
      aria-label={`${label}: ${value} ${unit}`}
    >
      <span
        className={cn(
          "shrink-0 rounded-xl font-display font-black leading-[0.72] tracking-[-0.09em] shadow-[3px_3px_0_rgba(15,23,42,0.16)]",
          size === "support" ? "px-1.5 pb-1 pt-1.5" : "px-2 pb-1 pt-2",
          size === "hero"
            ? "text-[3rem] min-[620px]:text-[5.5rem]"
            : "text-[1.75rem] min-[620px]:text-[3.65rem]",
          tone[numberTone].bg,
          tone[numberTone].onSolid,
        )}
        data-aa-contrast
      >
        {value}
      </span>
      <span className="pb-0.5">
        <span
          className={cn(
            "block font-display font-black uppercase leading-none text-slate-950",
            size === "hero"
              ? "text-sm min-[620px]:text-xl"
              : "text-[10px] min-[620px]:text-sm",
          )}
        >
          {unit}
        </span>
        <span
          className={cn(
            "block font-mono text-[9px] font-black uppercase leading-tight tracking-[0.08em] text-slate-600",
            size === "support" ? "mt-0.5" : "mt-1",
          )}
        >
          {label}
        </span>
      </span>
    </div>
  );
}

export function ContrastPair({
  left,
  right,
  compact = false,
}: {
  left: string;
  right: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] items-center",
        compact ? "gap-0.5" : "gap-1.5",
      )}
      aria-label={`${left}, em contraste com ${right}`}
    >
      <span
        className={cn(
          "rounded-lg bg-emerald-100 text-center font-display font-black uppercase leading-tight text-emerald-950 shadow-sm ring-1 ring-inset ring-emerald-400",
          compact
            ? "px-1 py-0.5 text-[8px] min-[620px]:py-1 min-[620px]:text-[10px]"
            : "px-1.5 py-1.5 text-[11px] min-[620px]:text-sm",
        )}
        data-aa-contrast
      >
        {!compact ? (
          <Check className="mr-1 inline h-3.5 w-3.5 stroke-[3]" aria-hidden />
        ) : null}
        {left}
      </span>
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-amber-300 font-display font-black text-slate-950",
          compact ? "h-5 w-5 text-xs" : "h-6 w-6 text-sm",
        )}
        aria-hidden
      >
        ≠
      </span>
      <span
        className={cn(
          "rounded-lg bg-rose-100 text-center font-display font-black uppercase leading-tight text-rose-950 shadow-sm ring-1 ring-inset ring-rose-400",
          compact
            ? "px-1 py-0.5 text-[8px] min-[620px]:py-1 min-[620px]:text-[10px]"
            : "px-1.5 py-1.5 text-[11px] min-[620px]:text-sm",
        )}
        data-aa-contrast
      >
        {!compact ? (
          <X className="mr-1 inline h-3.5 w-3.5 stroke-[3]" aria-hidden />
        ) : null}
        {right}
      </span>
    </div>
  );
}

export function WrongRightLockup({
  label,
  wrong,
  right,
  compact = false,
}: {
  label: string;
  wrong: ReactNode;
  right: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-[1.55rem_1.35rem_1fr] grid-rows-2 items-stretch gap-1 min-[620px]:grid-cols-[2rem_1fr_1.65rem_1fr] min-[620px]:grid-rows-1 min-[620px]:gap-1.5", compact ? "py-0.5" : "py-1")}>
      <span
        className="row-span-2 flex aspect-square self-center items-center justify-center rounded-full bg-slate-950 font-display text-xs font-black text-white shadow-sm min-[620px]:row-span-1 min-[620px]:text-sm"
        data-aa-contrast
      >
        {label}
      </span>
      <span
        className={cn("relative col-span-2 flex min-w-0 items-center rounded-md bg-rose-100 px-1.5 font-body font-bold leading-tight text-rose-950 shadow-sm ring-1 ring-inset ring-rose-300 min-[620px]:col-span-1 min-[620px]:px-2", compact ? "py-0.5 text-[8px] min-[620px]:text-[10px]" : "py-1 text-[9px] min-[620px]:text-xs")}
        data-aa-contrast
      >
        <X
          className="mr-1 inline h-3 w-3 stroke-[3] text-rose-600"
          aria-hidden
        />
        {wrong}
      </span>
      <span
        className="flex items-center justify-center rounded-md bg-amber-300 text-slate-950 shadow-sm"
        aria-hidden
      >
        <ArrowRight className="h-4 w-4 stroke-[3]" />
      </span>
      <span
        className={cn("flex min-w-0 items-center rounded-md bg-emerald-100 px-1.5 font-body font-black leading-tight text-emerald-950 shadow-sm ring-1 ring-inset ring-emerald-300 min-[620px]:px-2", compact ? "py-0.5 text-[8px] min-[620px]:text-[10px]" : "py-1 text-[9px] min-[620px]:text-xs")}
        data-aa-contrast
      >
        <Check
          className="mr-1 inline h-3 w-3 stroke-[3] text-emerald-600"
          aria-hidden
        />
        {right}
      </span>
    </div>
  );
}

export function ArrowPath({
  labels,
  tones,
}: {
  labels: string[];
  tones?: Tone[];
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1"
      aria-label={labels.join(" para ")}
    >
      {labels.map((label, index) => (
        <span key={label} className="contents">
          <span
            className={cn(
              "rounded-md px-1 py-1.5 text-center font-mono text-[8px] font-black uppercase leading-tight tracking-wide shadow-sm min-[620px]:text-[9px]",
              tone[tones?.[index] ?? "sky"].soft,
              tone[tones?.[index] ?? "sky"].text,
            )}
            data-aa-contrast
          >
            {label}
          </span>
          {index < labels.length - 1 ? (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-slate-950"
              aria-hidden
            >
              <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

export function TimelineSpine({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-0 flex-1 grid-cols-2 grid-rows-2 items-center gap-x-4 gap-y-1 before:absolute before:bottom-[10%] before:left-1/2 before:top-[10%] before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-b before:from-sky-500 before:via-teal-500 before:to-rose-500 min-[620px]:grid-cols-4 min-[620px]:grid-rows-1 min-[620px]:items-end min-[620px]:gap-1 min-[620px]:before:bottom-[2.1rem] min-[620px]:before:left-[10%] min-[620px]:before:right-[10%] min-[620px]:before:top-auto min-[620px]:before:h-1 min-[620px]:before:w-auto min-[620px]:before:translate-x-0 min-[620px]:before:bg-gradient-to-r">
      {children}
    </div>
  );
}

export function CentralConceptOrbit({
  center,
  children,
}: {
  center: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative mt-2 grid min-h-0 flex-1 grid-cols-[1fr_5.5rem_1fr] grid-rows-2 items-center gap-x-2 gap-y-1 min-[620px]:grid-cols-[1fr_8rem_1fr]">
      <div className="col-start-2 row-span-2 row-start-1 z-10">{center}</div>
      {children}
      <div
        className="absolute left-[25%] right-[25%] top-1/2 h-px bg-sky-300"
        aria-hidden
      />
    </div>
  );
}

export function MnemonicStrip({
  children,
  tone: stripTone = "ink",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      className={cn(
        "mt-auto px-3 py-1.5 text-center font-display text-[11px] font-black uppercase tracking-[0.08em] shadow-[3px_3px_0_rgba(15,23,42,0.15)] min-[620px]:text-sm",
        tone[stripTone].bg,
        tone[stripTone].onSolid,
      )}
      data-aa-contrast
    >
      {children}
    </div>
  );
}

export function IconFact({
  icon,
  label,
  body,
  tone: factTone = "sky",
  className,
}: {
  icon: NursingIconId;
  label: string;
  body: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-w-0 rounded-lg border-l-[5px] p-2 shadow-sm",
        tone[factTone].border,
        tone[factTone].soft,
        className,
      )}
    >
      <NursingIcon
        icon={icon}
        className={cn(
          "mb-1 h-6 w-6 min-[620px]:h-8 min-[620px]:w-8",
          tone[factTone].text,
        )}
      />
      <p className="font-display text-[10px] font-black uppercase leading-tight text-slate-950 min-[620px]:text-sm">
        {label}
      </p>
      <p className="mt-0.5 font-body text-[10px] font-semibold leading-tight text-slate-700 min-[620px]:text-xs">
        {body}
      </p>
    </div>
  );
}

export function EditorialSticker({
  children,
  tone: stickerTone = "amber",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rotate-[-2deg] items-center justify-center whitespace-normal border-2 border-slate-950 px-2 py-1 text-center font-display text-xs font-black uppercase leading-tight shadow-[3px_3px_0_#0f172a] min-[620px]:text-sm",
        tone[stickerTone].soft,
        tone[stickerTone].text,
        className,
      )}
      data-aa-contrast
    >
      {children}
    </span>
  );
}

export function DecisionFunnel({
  children,
  result,
}: {
  children: ReactNode;
  result: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-label="Funil de decisão">
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 min-[620px]:grid-cols-4 min-[620px]:grid-rows-1 min-[620px]:gap-2">
        {children}
      </div>
      <div
        className="mx-auto h-4 w-28 bg-amber-300 [clip-path:polygon(0_0,100%_0,62%_100%,38%_100%)] min-[620px]:h-5 min-[620px]:w-40"
        aria-hidden
      />
      <div className="mx-auto w-[78%]">{result}</div>
    </div>
  );
}

export function EditorialDeck({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-2 auto-rows-fr gap-1.5 min-[620px]:grid-cols-3 min-[620px]:gap-2 [&>*:last-child:nth-child(odd)]:col-span-2 min-[620px]:[&>*:last-child:nth-child(odd)]:col-span-1"
      aria-label="Unidades equivalentes da regra"
    >
      {children}
    </div>
  );
}
