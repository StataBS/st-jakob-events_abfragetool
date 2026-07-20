export default defineNuxtPlugin(() => {
  const { matomoUrl, matomoSiteId } = useRuntimeConfig().public
  if (!matomoUrl || !matomoSiteId) return

  useScriptMatomoAnalytics({
    matomoUrl: String(matomoUrl),
    siteId: Number(matomoSiteId),
  })
})
