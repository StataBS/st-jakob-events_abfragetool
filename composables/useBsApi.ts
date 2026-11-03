export function useBsApi() {
    const fetchJson = async (dataset: string) => {
        return await $fetch<any[]>(`/api/bs/${dataset}`)
    }

    /** Visitor categories (100418). Returns [] if unavailable. */
    const fetchBesucher = async () => {
        try {
            return await fetchJson('besucher')
        } catch {
            return []
        }
    }

    return {
        fetchEvents: () => fetchJson('events'),
        fetchBesucher,
        fetchAnreise: () => fetchJson('anreise'),
        fetchTimedInfo: () => fetchJson('info'),
    }
}
