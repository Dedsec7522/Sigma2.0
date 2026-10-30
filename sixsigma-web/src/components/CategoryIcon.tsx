import type { Icon } from "@phosphor-icons/react";
import { ArrowsClockwise, ChartBar, Funnel, Gauge, Target, TrendUp } from "@phosphor-icons/react/dist/ssr";

const ICONS: Record<string, Icon> = {
  "lean-six-sigma-training": Gauge,
  "six-sigma-training": Target,
  "lean-training": Funnel,
  "kaizen-training": ArrowsClockwise,
  "business-improvement-tools": ChartBar,
  "continuous-business-improvement": TrendUp,
};

export function CategoryIcon({ slug, size = 24, className }: { slug: string; size?: number; className?: string }) {
  const I = ICONS[slug] ?? Target;
  return <I aria-hidden size={size} weight="duotone" className={className} />;
}
