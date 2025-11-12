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
