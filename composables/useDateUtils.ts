const pad2 = (n: number) => String(n).padStart(2, '0');
const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

export const normalizeISODateString = (d?: string) => {
    if (!d) return null;
    const parts = d.split('-');
    if (parts.length !== 3) return null;

    const [yStr, mStr, ddStr] = parts;
    const y = Number(yStr), m = Number(mStr), dd = Number(ddStr);
    if (![y, m, dd].every(Number.isInteger)) return null;

    // clamp month to 1..12; then clamp day to 1..daysInMonth
    const mm = clamp(m, 1, 12);
    const daysInMonth = new Date(y, mm, 0).getDate();
    const day = clamp(dd, 1, daysInMonth);

    // return strictly formatted YYYY-MM-DD without timezone games
    return `${yStr.length === 4 ? yStr : String(y)}-${pad2(mm)}-${pad2(day)}`;
};

export const parseISO = (d?: string) => {
    const n = normalizeISODateString(d);
    if (!n) return null;
    const [y, m, dd] = n.split('-').map(Number);
    return new Date(y, m - 1, dd);
};

/** Local calendar date → YYYY-MM-DD (avoids UTC/DST shifts from toISOString). */
export const toISODateString = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Today's local date as YYYY-MM-DD. */
export const todayISODateString = () => toISODateString(new Date());

/** Shift an ISO date by N calendar days in local time. */
export const addDaysISO = (iso: string, deltaDays: number) => {
    const d = parseISO(iso) ?? new Date();
    d.setDate(d.getDate() + deltaDays);
    return toISODateString(d);
};

/** Shift an ISO date by N years, clamping day to the target month (e.g. Feb 29 → 28). */
export const addYearsISO = (iso: string, deltaYears: number) => {
    const n = normalizeISODateString(iso);
    const d = parseISO(n || undefined) ?? new Date();
    const y = d.getFullYear() + deltaYears;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const daysInMonth = new Date(y, m, 0).getDate();
    return `${y}-${pad2(m)}-${pad2(clamp(day, 1, daysInMonth))}`;
};

export const parseMinutes = (t?: string) => {
    if (!t) return NaN;
    const [h, m] = t.split(':').map(Number);
    if ([h, m].some(Number.isNaN)) return NaN;
    return h * 60 + m;
};

export const fmtDE = (d?: string) => {
    const dt = parseISO(d);
    if (!dt) return '–';
    const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    return `${dt.getDate()}. ${months[dt.getMonth()]} ${dt.getFullYear()}`;
};

export function formatGermanLong(iso: string): string {
    const dt = new Date(iso + 'T00:00:00Z')
    const weekday = dt.toLocaleDateString('de-CH', { weekday: 'long' })
    const date = dt.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
    // Capitalize first letter of weekday (some locales already do)
    const w = weekday.charAt(0).toUpperCase() + weekday.slice(1)
    return `${w}, ${date}`
}
