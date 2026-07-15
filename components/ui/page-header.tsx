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
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        {breadcrumb && (
          <nav className="mb-2 flex items-center gap-1.5" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-xs text-muted-foreground/40">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1
          className={titleClassName ?? 'truncate text-2xl font-bold text-foreground'}
          style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
        >
          {title}
        </h1>
        {description && (
          <p className={descriptionClassName ?? 'mt-1 text-sm text-muted-foreground'}>{description}</p>
        )}
      </div>
      {action ? <div className="w-full shrink-0 sm:ml-4 sm:w-auto">{action}</div> : null}
    </div>
  );
}
