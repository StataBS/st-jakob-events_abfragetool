export type ViewMode = 'tag' | 'woche'

const SUB_DAY = 'tagesansicht'
const SUB_WEEK = 'wochenansicht'

function swapSubdomain(host: string, to: ViewMode) {
    const want = to === 'woche' ? SUB_WEEK : SUB_DAY
    // replace left-most label, keep everything else (e.g., .example.ch)
    return host.replace(/^[^.]+/, want)
}

export function useViewMode() {
    const route = useRoute()
    const mode = ref<ViewMode>('tag')

    if (import.meta.client) {
        mode.value = window.location.hostname.startsWith(SUB_WEEK) ? 'woche' : 'tag'
    } else {
        const url = useRequestURL()
        mode.value = url.host.startsWith(SUB_WEEK) ? 'woche' : 'tag'
    }

    function go(to: ViewMode, iso?: string) {
        const url = new URL(window.location.href)
        url.host = swapSubdomain(url.host, to)
        if (iso) url.searchParams.set('datum', iso)
        window.location.href = url.toString()
    }

    return { mode, go, isWeek: computed(() => mode.value === 'woche') }
}
