type Request = {
  method?: string
  body?: unknown
}

type Response = {
  status: (code: number) => Response
  json: (body: object) => void
  end: () => void
}

export default function handler(request: Request, response: Response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  console.error(JSON.stringify({
    category: 'client.failure',
    payload: request.body,
    receivedAt: new Date().toISOString(),
  }))
  response.status(204).end()
}