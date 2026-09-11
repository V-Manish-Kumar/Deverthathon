export default function handler(_request: unknown, response: { status: (code: number) => { json: (body: object) => void } }) {
  console.error(JSON.stringify({
    category: 'api.failure',
    message: 'Intentional API failure for observability testing.',
    timestamp: new Date().toISOString(),
  }))
  response.status(500).json({ error: 'Intentional API failure for observability testing.' })
}