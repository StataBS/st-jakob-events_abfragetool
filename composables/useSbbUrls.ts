import { normalizeISODateString } from '~/composables/useDateUtils'

const SBB_HREF_RE = /href="(https?:\/\/(?:www\.)?sbb\.ch\/[^"]*)"/gi

function setSbbDayParam(encodedUrl: string, day: string): string {
    const decoded = encodedUrl.replace(/&amp;/g, '&')
    const qIndex = decoded.indexOf('?')
    if (qIndex === -1) {
        return `${decoded}?day=${day}`.replace(/&/g, '&amp;')
    }

    const base = decoded.slice(0, qIndex)
    const params = decoded
        .slice(qIndex + 1)
        .split('&')
        .filter(p => p && !p.startsWith('day='))
    params.push(`day=${day}`)
    return `${base}?${params.join('&')}`.replace(/&/g, '&amp;')
}

/** Append or replace the SBB `day` query param on every sbb.ch link in HTML. */
export function injectSbbDayParam(
    html: string | null | undefined,
    isoDate: string,
): string | null | undefined {
    if (!html) return html

    const day = normalizeISODateString(isoDate)
    if (!day) return html

    return html.replace(SBB_HREF_RE, (_match, url: string) => {
        return `href="${setSbbDayParam(url, day)}"`
    })
}
