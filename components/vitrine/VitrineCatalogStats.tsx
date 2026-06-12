import VitrineCatalogStatsStrip from '@/components/vitrine/VitrineCatalogStatsStrip';

type VitrineCatalogStatsProps = {
  totalQuestions: number;
  totalSlides: number;
};

/** @deprecated Prefer VitrineCatalogStatsStrip */
export default function VitrineCatalogStats(props: VitrineCatalogStatsProps) {
  return <VitrineCatalogStatsStrip {...props} />;
}
