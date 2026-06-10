export default function VitrineCatalogStatsSkeleton() {
  return (
    <div
      className="mb-4 grid grid-cols-2 gap-2 animate-pulse sm:mb-6 sm:gap-4"
      aria-hidden
    >
      <div className="h-[72px] rounded-xl bg-muted/50 sm:h-[104px] sm:rounded-2xl lg:h-[112px]" />
      <div className="h-[72px] rounded-xl bg-muted/50 sm:h-[104px] sm:rounded-2xl lg:h-[112px]" />
    </div>
  );
}
