import type { MDXComponents } from 'mdx/types.js';
import type { ComponentPropsWithoutRef } from 'react';
import { StudyCtaInline } from '@/components/blog/StudyCtaInline';

type CodeProps = ComponentPropsWithoutRef<'code'>;

function MdxCode({ className, children, ...props }: CodeProps) {
  const isBlock = typeof className === 'string' && className.includes('language-');
  if (isBlock) {
    return (
      <code className={`${className ?? ''} bg-transparent p-0 font-mono text-inherit`} {...props}>
        {children}
      </code>
    );
  }
  return (
    <code className="rounded-lg bg-white/10 px-2 py-1 text-sm text-cyan-200" {...props}>
      {children}
    </code>
  );
}

/** Tipografia MDX do blog (tema dark, alinhado à landing). */
export const blogMdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-2xl font-black tracking-tight text-white first:mt-0 sm:text-3xl" {...props} />
  ),
  h2: (props) => (
    <>
      <h2
        className="mt-12 mb-4 border-l-4 border-cyan-400 pl-4 text-2xl font-black text-white"
        {...props}
      />
      <StudyCtaInline />
    </>
  ),
  h3: (props) => <h3 className="mt-8 mb-3 text-xl font-black text-slate-100" {...props} />,
  p: (props) => <p className="mb-4 text-base leading-relaxed text-slate-400" {...props} />,
  ul: (props) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-400 marker:text-cyan-400" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-400 marker:text-cyan-400" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a
      className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-black text-white" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-4 border-[#F26522] rounded-r-2xl bg-white/5 py-4 pr-4 pl-6 text-slate-300 italic"
      {...props}
    />
  ),
  code: (props) => <MdxCode {...props} />,
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm leading-relaxed text-slate-200"
      {...props}
    />
  ),
  hr: (props) => <hr className="my-10 border-white/10" {...props} />,
};
