export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const payload = {
    runId: 'feedback-debug-pre-fix',
    hypothesisId: 'H-runtime-config-mismatch',
    location: 'app/server/api/feedback-debug.get.ts',
    message: 'Feedback runtime/env presence snapshot',
    data: {
      runtime: {
        feedbackRepoSet: Boolean(config.feedback?.repo),
        feedbackRepoOwnerSet: Boolean(config.feedback?.repoOwner),
        feedbackProjectSet: Boolean(config.feedback?.project),
        feedbackGithubTokenSet: Boolean(config.feedback?.githubToken),
      },
      env: {
        GITHUB_TOKEN_set: Boolean(process.env.GITHUB_TOKEN),
        NUXT_GITHUB_TOKEN_set: Boolean(process.env.NUXT_GITHUB_TOKEN),
        NUXT_FEEDBACK_GITHUB_TOKEN_set: Boolean(process.env.NUXT_FEEDBACK_GITHUB_TOKEN),
      },
      nodeEnv: process.env.NODE_ENV ?? null,
    },
    timestamp: Date.now(),
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1e53032e-6157-4ec0-a14d-66f0b21ccb74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{})
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1e53032e-6157-4ec0-a14d-66f0b21ccb74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'feedback-debug-pre-fix',hypothesisId:'H1-token-missing-at-runtime',location:'app/server/api/feedback-debug.get.ts',message:'Token availability check',data:{runtimeFeedbackGithubTokenSet:Boolean(config.feedback?.githubToken),envGITHUB_TOKENSet:Boolean(process.env.GITHUB_TOKEN),envNUXT_GITHUB_TOKENSet:Boolean(process.env.NUXT_GITHUB_TOKEN),envNUXT_FEEDBACK_GITHUB_TOKENSet:Boolean(process.env.NUXT_FEEDBACK_GITHUB_TOKEN)},timestamp:Date.now()})}).catch(()=>{})
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1e53032e-6157-4ec0-a14d-66f0b21ccb74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'feedback-debug-pre-fix',hypothesisId:'H2-repo-config-missing',location:'app/server/api/feedback-debug.get.ts',message:'Repo metadata availability check',data:{feedbackRepoSet:Boolean(config.feedback?.repo),feedbackRepoOwnerSet:Boolean(config.feedback?.repoOwner),feedbackProjectSet:Boolean(config.feedback?.project),envFEEDBACK_REPOSet:Boolean(process.env.FEEDBACK_REPO),envFEEDBACK_REPO_OWNERSet:Boolean(process.env.FEEDBACK_REPO_OWNER),envFEEDBACK_PROJECTSet:Boolean(process.env.FEEDBACK_PROJECT)},timestamp:Date.now()})}).catch(()=>{})
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1e53032e-6157-4ec0-a14d-66f0b21ccb74',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'feedback-debug-pre-fix',hypothesisId:'H3-runtime-context',location:'app/server/api/feedback-debug.get.ts',message:'Runtime request context',data:{nodeEnv:process.env.NODE_ENV ?? null,url:getRequestURL(event).toString(),method:event.method},timestamp:Date.now()})}).catch(()=>{})
  // #endregion

  return payload.data
})
