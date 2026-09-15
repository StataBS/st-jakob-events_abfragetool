import { withHttps, withoutTrailingSlash } from 'ufo'

export default defineNuxtPlugin(() => {
  const { matomoUrl, matomoSiteId } = useRuntimeConfig().public
  if (!matomoUrl || !matomoSiteId) return

  // Nuxt Scripts joins /matomo.js|/matomo.php with matomoUrl via withBase.
  // Without a scheme, the browser treats it as a path on this app → 400/MIME errors.
  const origin = withoutTrailingSlash(withHttps(String(matomoUrl)))

  useScriptMatomoAnalytics({
    matomoUrl: origin,
    siteId: Number(matomoSiteId),
  })
})
