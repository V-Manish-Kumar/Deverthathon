type Request = {
  method?: string
  body?: unknown
}

type Response = {
  status: (code: number) => Response
  json: (body: object) => void
  end: () => void
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function redactSecrets(text: string): string {
  if (!text) return ''
  return text
    .replace(/ghp_[A-Za-z0-9_]{36,}/g, 'ghp_REDACTED')
    .replace(/github_pat_[A-Za-z0-9_]{60,}/g, 'github_pat_REDACTED')
    .replace(/sk-or-v1-[a-f0-9]{64}/g, 'sk-or-v1-REDACTED')
    .replace(/AIzaSy[A-Za-z0-9\-_]{33}/g, 'AIzaSy_REDACTED')
    .replace(/vcp_[A-Za-z0-9_]{40,}/g, 'vcp_REDACTED')
    .replace(/[0-9]{8,10}:[A-Za-z0-9\-_]{35}/g, 'TELEGRAM_BOT_TOKEN_REDACTED')
}

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8985040285:AAE-rUcRQAqnMLVE0iP8FnVNwjsbOfamORU'
  const chatId = process.env.TELEGRAM_CHAT_ID || '6829356423'
  if (!token || !chatId) return false

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: redactSecrets(text),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('Failed to send Telegram message:', err)
    return false
  }
}

export default async function handler(_request: unknown, response: { status: (code: number) => { json: (body: object) => void } }) {
  const timestamp = new Date().toISOString()
  const errorMsg = 'Intentional API failure for observability testing (HTTP 500 Internal Server Error).'

  console.error(JSON.stringify({
    category: 'api.failure',
    message: errorMsg,
    timestamp,
  }))

  const card = `🚨 <b>WEBSITE RUNTIME ERROR DETECTED</b>

<b>Project:</b> <code>deverthathon</code>
<b>Branch:</b> <code>Dev</code>
<b>Category:</b> <code>api.failure</code>
<b>URL:</b> <code>https://deverthathon.vercel.app/api/error</code>
<b>Timestamp:</b> <code>${timestamp}</code>

<b>Error Details &amp; Logs:</b>
<pre><code>HTTP 500 Internal Server Error: ${errorMsg}
Endpoint: /api/error</code></pre>

🔍 <i>Autonomous AI Agent analyzing error &amp; generating code repair...</i>`

  await sendTelegram(card)
  response.status(500).json({ error: errorMsg })
}
