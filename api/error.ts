export default function handler(_request: unknown, response: { status: (code: number) => { json: (body: object) => void } }) {
  console.log(JSON.stringify({
    category: 'api.recovered',
    message: 'API route recovered and functioning normally.',
    timestamp: new Date().toISOString(),
  }))
  response.status(200).json({ status: 'ok', message: 'API recovered from error state.' })
}