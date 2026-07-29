const EVENTS_URL   = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100419/exports/json'
const BESUCHER_URL = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100418/exports/json'
const ANREISE_URL  = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100429/exports/json'
const INFO_T_URL   = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100464/exports/json'

export function useBsApi() {
    const config = useRuntimeConfig()

    const withApiKey = (url: string) => {
        const key = String(config.public.bsApiKey || '').trim()
        if (!key) return url
        const sep = url.includes('?') ? '&' : '?'
        return `${url}${sep}apikey=${encodeURIComponent(key)}`
    }

    const fetchJson = async (url: string) => {
        return await $fetch<any[]>(withApiKey(url))
    }

    /** Visitor categories (100418). Returns [] if unavailable. */
    const fetchBesucher = async () => {
        try {
            return await fetchJson(BESUCHER_URL)
        } catch {
            return []
        }
    }

    return {
        fetchEvents: () => fetchJson(EVENTS_URL),
        fetchBesucher,
        fetchAnreise: () => fetchJson(ANREISE_URL),
        fetchTimedInfo: () => fetchJson(INFO_T_URL),
    }
}
