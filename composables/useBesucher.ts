/** Visitor-count tiers from dataset 100418 (Kategorie labels). */
export type BesucherTier = 'none' | 'unknown' | 'low' | 'mid' | 'high'
export type KnownBesucherTier = 'low' | 'mid' | 'high'

const TIER_META: Record<Exclude<BesucherTier, 'none'>, {
  icon: string
  label: string
}> = {
  unknown: {
    icon: '/icons/users-0.svg',
    label: 'Erwartete Besucherzahl unbekannt',
  },
  low: {
    icon: '/icons/users-1.svg',
    label: 'Unter 5’000 Besuchende erwartet',
  },
  mid: {
    icon: '/icons/users-2.svg',
    label: '5’000 bis 14’999 Besuchende erwartet',
  },
  high: {
    icon: '/icons/users-3.svg',
    label: '15’000 und mehr Besuchende erwartet',
  },
}

/**
 * Parse Kategorie from 100418.
 * Values look like: `< 5'000`, `5'000–14'999`, `≥ 15'000` (also accepts plain numbers).
 */
export function parseKategorieToTier(value: unknown): KnownBesucherTier | null {
  if (value == null || value === '') return null

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 15000) return 'high'
    if (value >= 5000) return 'mid'
    return 'low'
  }

  // Keep digits and comparison signs only — ignores ', ’, –, spaces, etc.
  const compact = String(value)
    .normalize('NFKC')
    .replace(/[^\d<≥>=]/g, '')

  if (!compact) return null

  if (compact.includes('≥15000') || compact.includes('>=15000')) return 'high'
  if (compact.includes('500014999')) return 'mid'
  if (compact.startsWith('<5000')) return 'low'

  // Plain numeric string fallback
  const n = Number(compact.replace(/^[<≥>=]+/, ''))
  if (Number.isFinite(n) && compact === String(n)) {
    if (n >= 15000) return 'high'
    if (n >= 5000) return 'mid'
    return 'low'
  }

  return null
}

export function besucherTierForDay(
  hasEvents: boolean,
  known: KnownBesucherTier | null | undefined,
): BesucherTier {
  if (!hasEvents) return 'none'
  if (!known) return 'unknown'
  return known
}

export function besucherMeta(tier: BesucherTier) {
  if (tier === 'none') return null
  return TIER_META[tier]
}

/** Map YYYY-MM-DD → known visitor tier from 100418 rows (`datum`, `kategorie`). */
export function buildVisitorTiersByDay(
  rows: unknown[] | null | undefined,
): Record<string, KnownBesucherTier> {
  const result: Record<string, KnownBesucherTier> = {}
  for (const row of rows || []) {
    const r = row as Record<string, unknown>
    const raw = r.datum ?? r.Datum ?? r.date
    if (!raw) continue
    const iso = String(raw).slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue
    const tier = parseKategorieToTier(r.kategorie ?? r.Kategorie)
    if (!tier) continue
    result[iso] = tier
  }
  return result
}

export function useBesucher() {
  return {
    parseKategorieToTier,
    besucherTierForDay,
    besucherMeta,
    buildVisitorTiersByDay,
  }
}
