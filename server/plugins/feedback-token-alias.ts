export default defineNitroPlugin(() => {
  const sourceToken = process.env.NUXT_GITHUB_TOKEN

  const before = {
    runtimeFeedbackTokenSet: Boolean(useRuntimeConfig().feedback?.githubToken),
    envGITHUB_TOKENSet: Boolean(process.env.GITHUB_TOKEN),
    envNUXT_GITHUB_TOKENSet: Boolean(process.env.NUXT_GITHUB_TOKEN),
    envNUXT_FEEDBACK_GITHUB_TOKENSet: Boolean(process.env.NUXT_FEEDBACK_GITHUB_TOKEN),
  }

  if (sourceToken && !process.env.GITHUB_TOKEN) {
    process.env.GITHUB_TOKEN = sourceToken
  }
  if (sourceToken && !process.env.NUXT_FEEDBACK_GITHUB_TOKEN) {
    process.env.NUXT_FEEDBACK_GITHUB_TOKEN = sourceToken
  }

  const runtimeConfig = useRuntimeConfig()
  if (!runtimeConfig.feedback?.githubToken && sourceToken) {
    runtimeConfig.feedback.githubToken = sourceToken
  }

  const after = {
    runtimeFeedbackTokenSet: Boolean(runtimeConfig.feedback?.githubToken),
    envGITHUB_TOKENSet: Boolean(process.env.GITHUB_TOKEN),
    envNUXT_GITHUB_TOKENSet: Boolean(process.env.NUXT_GITHUB_TOKEN),
    envNUXT_FEEDBACK_GITHUB_TOKENSet: Boolean(process.env.NUXT_FEEDBACK_GITHUB_TOKEN),
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1e53032e-6157-4ec0-a14d-66f0b21ccb74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'feedback-debug-post-fix',hypothesisId:'H5-runtime-token-aliasing',location:'app/server/plugins/feedback-token-alias.ts',message:'Applied startup token aliasing for feedback runtime config',data:{before,after},timestamp:Date.now()})}).catch(()=>{})
  // #endregion
})
