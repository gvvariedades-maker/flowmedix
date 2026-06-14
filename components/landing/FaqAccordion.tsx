'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div
            key={faq.question}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center gap-3 px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
            >
              <MessageCircleQuestion className="shrink-0 text-cyan-300" size={21} aria-hidden />
              <span className="flex-1 font-black text-white">{faq.question}</span>
              <ChevronDown
                size={18}
                aria-hidden
                className={cn(
                  'shrink-0 text-slate-400 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="border-t border-white/5 px-6 pb-5 pt-0"
              >
                <p className="pt-4 text-sm font-medium leading-relaxed text-slate-400">{faq.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
