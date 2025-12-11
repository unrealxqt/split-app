import * as Sentry from '@sentry/react-native'

const ENV = process.env.APP_ENV || 'development'

Sentry.init({
  dsn: 'https://0bf4c4639de3dd903b64a2c0f3cc8524@o4510494581915648.ingest.de.sentry.io/4510494591746128',
  sendDefaultPii: true,
  enableLogs: true,
  environment: ENV,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  tracesSampleRate: 0.25,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration()
  ]
})

export default Sentry;
