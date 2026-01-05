const EVENTS_URL   = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100419/exports/json'
const ANREISE_URL  = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100429/exports/json'
const INFO_T_URL   = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets/100464/exports/json'

export function useBsApi() {
    const fetchJson = async (url: string) => {
        return await $fetch<any[]>(url)
    }

    return {
        fetchEvents: () => fetchJson(EVENTS_URL),
        fetchAnreise: () => fetchJson(ANREISE_URL),
        fetchTimedInfo: () => fetchJson(INFO_T_URL),
    }
}
