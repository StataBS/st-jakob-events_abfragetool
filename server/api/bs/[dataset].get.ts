const DATASETS: Record<string, string> = {
  events: '100419',
  besucher: '100418',
  anreise: '100429',
  info: '100464',
}

export default defineEventHandler(async (event) => {
  const dataset = getRouterParam(event, 'dataset')
  const id = dataset ? DATASETS[dataset] : undefined
  if (!id) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown dataset' })
  }

  const config = useRuntimeConfig()
  const key = String(config.bsApiKey || '').trim()
  let url = `https://data.bs.ch/api/explore/v2.1/catalog/datasets/${id}/exports/json`
  if (key) {
    url += `?apikey=${encodeURIComponent(key)}`
  }

  return await $fetch(url)
})
