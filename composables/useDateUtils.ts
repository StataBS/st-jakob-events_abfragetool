export const parseMinutes = (t?: string) => {
    if (!t) return NaN
    const [h, m] = t.split(':').map(Number)
    if ([h, m].some(Number.isNaN)) return NaN
    return h * 60 + m
}

export const parseISO = (d?: string) => {
    if (!d) return null
    const [y, m, dd] = d.split('-').map(Number)
    if ([y, m, dd].some(Number.isNaN)) return null
    return new Date(y, m - 1, dd)
}

export const fmtDE = (d?: string) => {
    const dt = parseISO(d)
    if (!dt) return '–'
    const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
    return `${dt.getDate()}. ${months[dt.getMonth()]} ${dt.getFullYear()}`
}
