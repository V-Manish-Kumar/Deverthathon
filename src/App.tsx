import { useEffect, useState } from 'react'
import './App.css'

type EventItem = {
  label: string
  detail: string
  tone: 'ready' | 'warning' | 'danger'
}

const initialEvents: EventItem[] = [
  { label: 'Workspace ready', detail: 'No failures triggered yet.', tone: 'ready' },
]

function reportError(category: string, error: unknown) {
  const normalizedError = error instanceof Error ? error : new Error(String(error))
  const payload = JSON.stringify({
    category,
    message: normalizedError.message,
    stack: normalizedError.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/log-error', new Blob([payload], { type: 'application/json' }))
  } else {
    void fetch('/api/log-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  }
}

function App() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [showRenderFailure, setShowRenderFailure] = useState(false)

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => reportError('window.error', event.error ?? event.message)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => reportError('unhandledrejection', event.reason)

    window.addEventListener('error', handleWindowError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('error', handleWindowError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  useEffect(() => {
    if (showRenderFailure) {
      const error = new Error('Intentional render failure: Error Boundary test')
      reportError('render.exception', error)
      throw error
    }
  }, [showRenderFailure])

  const addEvent = (event: EventItem) => setEvents((current) => [event, ...current])

  const triggerClickError = () => {
    const error = new Error('Intentional click exception: button handler test')
    addEvent({ label: 'Click exception', detail: 'Error thrown from button handler.', tone: 'danger' })
    reportError('click.exception', error)
    throw error
  }

  const triggerRejectedPromise = () => {
    const error = new Error('Intentional unhandled rejection: async test')
    addEvent({ label: 'Unhandled rejection', detail: 'Promise rejected without a catch.', tone: 'warning' })
    reportError('promise.rejection', error)
    Promise.reject(error)
  }

  const triggerApiError = async () => {
    addEvent({ label: 'API request started', detail: 'Calling /api/error for a 500 response.', tone: 'warning' })
    const response = await fetch('/api/error')
    if (!response.ok) {
      addEvent({ label: 'API 500 received', detail: `Server responded with ${response.status}.`, tone: 'danger' })
    }
  }

  const triggerMissingRoute = () => {
    reportError('route.404', new Error('Intentional 404 route: /this-route-does-not-exist'))
    window.location.assign('/this-route-does-not-exist')
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">!</span><span>Faultline</span></div>
        <div className="status"><span className="status-dot" />Test environment</div>
      </header>

      <section className="intro">
        <p className="eyebrow">VERCEL DEPLOYMENT LAB / 01</p>
        <h1>Make something<br /><em>break on purpose.</em></h1>
        <p className="lede">A small, intentional failure playground for checking error tracking, logs, alerts, and incident workflows in a deployed app.</p>
      </section>

      <section className="lab-grid" aria-label="Error triggers">
        <div className="panel trigger-panel">
          <div className="panel-heading"><span>Trigger library</span><span className="count">05 cases</span></div>
          <div className="trigger-list">
            <button className="trigger" onClick={() => setShowRenderFailure(true)}>
              <span className="trigger-icon">◈</span><span><strong>Render exception</strong><small>Throw during the render lifecycle</small></span><span className="arrow">↗</span>
            </button>
            <button className="trigger" onClick={triggerClickError}>
              <span className="trigger-icon">⌁</span><span><strong>Click exception</strong><small>Throw from a user interaction</small></span><span className="arrow">↗</span>
            </button>
            <button className="trigger" onClick={triggerRejectedPromise}>
              <span className="trigger-icon">∿</span><span><strong>Unhandled rejection</strong><small>Reject a promise without recovery</small></span><span className="arrow">↗</span>
            </button>
            <button className="trigger" onClick={() => void triggerApiError()}>
              <span className="trigger-icon">⇄</span><span><strong>API failure</strong><small>Request a serverless function returning 500</small></span><span className="arrow">↗</span>
            </button>
            <button className="trigger" onClick={triggerMissingRoute}>
              <span className="trigger-icon">⌗</span><span><strong>404 route</strong><small>Navigate to a path that does not exist</small></span><span className="arrow">↗</span>
            </button>
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-heading"><span>Activity stream</span><button className="clear" onClick={() => setEvents(initialEvents)}>Clear</button></div>
          <div className="event-list">
            {events.map((event, index) => (
              <div className="event" key={`${event.label}-${index}`}>
                <span className={`event-dot ${event.tone}`} />
                <div><strong>{event.label}</strong><p>{event.detail}</p></div>
                <time>{index === 0 ? 'now' : `${index}m`}</time>
              </div>
            ))}
          </div>
          <div className="hint"><span>i</span> Errors are intentional. Use your browser console and Vercel logs to inspect each signal.</div>
        </div>
      </section>

      <footer><span>FAULTLINE / v1.0.0</span><span>Built for observability testing</span></footer>
    </main>
  )
}

export default App
