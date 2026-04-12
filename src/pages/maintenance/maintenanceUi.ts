export const MAINTENANCE_UI_KEYS = [
  "resort-hero",
  "minimal-dawn",
  "midnight-tech",
  "sunset-warm",
  "split-showcase",
  "floating-card",
  "console-status",
  "coastal-breeze",
  "editorial-serif",
  "neon-night",
] as const;

export type MaintenanceUiVariant = (typeof MAINTENANCE_UI_KEYS)[number];

export const DEFAULT_MAINTENANCE_UI_VARIANT: MaintenanceUiVariant = "resort-hero";

export function normalizeMaintenanceUiVariant(
  value: string | undefined | null,
): MaintenanceUiVariant {
  const candidate = (value ?? "").trim();
  return (MAINTENANCE_UI_KEYS as readonly string[]).includes(candidate)
    ? (candidate as MaintenanceUiVariant)
    : DEFAULT_MAINTENANCE_UI_VARIANT;
}

export type MaintenanceContentProps = {
  badge: string;
  title: string;
  description: string;
  eta: string;
};
