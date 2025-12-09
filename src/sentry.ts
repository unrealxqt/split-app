import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: 'https://0bf4c4639de3dd903b64a2c0f3cc8524@o4510494581915648.ingest.de.sentry.io/4510494591746128',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration()
  ]
})

export default Sentry;
