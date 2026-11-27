import { parseMinutes, parseISO } from './useDateUtils'

/** Same ordering as Tagesansicht: Beginn, then duration. */
export function sortEventsByBeginn(events: any[]) {
    const parseT = parseMinutes
    return [...events].sort((a, b) => {
        const sa = parseT(a.beginn), sb = parseT(b.beginn)
        if (Number.isNaN(sa) && Number.isNaN(sb)) return 0
        if (Number.isNaN(sa)) return 1
        if (Number.isNaN(sb)) return -1
        if (sa !== sb) return sa - sb
        const ea = parseT(a.ende), eb = parseT(b.ende)
        const da = Number.isNaN(ea) ? Infinity : (ea <= sa ? ea + 1440 : ea) - sa
        const db = Number.isNaN(eb) ? Infinity : (eb <= sb ? eb + 1440 : eb) - sb
        return da - db
    })
}

export function useFilters() {
    // events (100419)
    const filterEventsByDate = (data: any[], selected: string) => {
        if (!selected) return []
        return sortEventsByBeginn(data.filter(i => i.datum === selected))
    }

    // timed info (100464) covering selected date
    const filterTimedInfoCoveringDate = (data: any[], selected: string) => {
        if (!selected) return []
        const sel = parseISO(selected)!
        return data
            .filter(it => {
                const s = parseISO(it.beginn), e = parseISO(it.ende)
                if (!s || !e) return false
                return s <= sel && sel <= e
            })
            .sort((a, b) => (parseISO(a.beginn)!.getTime() - parseISO(b.beginn)!.getTime()))
    }

    return { filterEventsByDate, filterTimedInfoCoveringDate, sortEventsByBeginn }
}
