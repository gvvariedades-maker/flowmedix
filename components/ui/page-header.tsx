import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  action?: React.ReactNode;
  description?: string;
  titleClassName?: string;
  /** Substitui as classes padrão da descrição (ex.: dark pages com `text-slate-400`). */
  descriptionClassName?: string;
}

export function PageHeader({
  title,
  breadcrumb,
  action,
  description,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="min-w-0">
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 mb-2" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/20 text-xs">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs text-[#8b949e]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1
          className={titleClassName ?? "text-2xl font-bold text-[#e6edf3] truncate"}
          style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
        >
          {title}
        </h1>
        {description && (
          <p className={descriptionClassName ?? 'text-sm text-[#8b949e] mt-1'}>{description}</p>
        )}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}
