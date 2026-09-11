# Faultline

Faultline is a small Vite + React error-testing site for Vercel deployments. Every trigger reports to a Vercel serverless function, which writes a structured `console.error` entry for the Vercel runtime logs.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and use the trigger library. Vite does not emulate Vercel serverless functions locally, so deploy to verify the log forwarding endpoint.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Keep the detected framework as Vite and deploy.

After deployment, watch logs from the Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel logs https://your-deployment-url.vercel.app --follow
```

Click a trigger in the deployed site. The CLI will show JSON log entries with `category`, `message`, `url`, and timestamps. The API failure also writes directly from `api/error.ts` before returning HTTP 500.

## Included test signals

- Render exception: browser error is forwarded before the intentional throw.
- Click exception: handler error is forwarded before the intentional throw.
- Unhandled rejection: rejection is forwarded and then rejected.
- API failure: `/api/error` writes `console.error` and returns HTTP 500.
- 404 route: the client reports the missing route before navigation.

The failures are intentional and should only be deployed to a test project.
