[README.md](https://github.com/user-attachments/files/32999679/README.md)
# Calculator Frontend

Vue 3 + Vite client for the calculator assignment. It sends expressions to the
backend, displays the server's answer, and loads/deletes history through the API.
There is no client-side expression evaluator.

## Requirements

- Node.js 18 or later (Node.js 20 LTS recommended)
- npm
- The backend running at `http://localhost:8080`

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend. To point
the proxy at another backend, copy `.env.example` to `.env.local`, set
`VITE_BACKEND_URL`, and restart Vite.

Create production assets with `npm run build`; output is written to `dist/`.
For a deployed frontend, configure the web server to proxy `/api` to the backend
or adapt the API base URL and backend CORS allowlist for the actual deployment.

## Features

- Expression entry and keypad for arithmetic operators and parentheses
- Backend-only calculation and error display
- Database-backed history listing and single-record deletion
- Responsive layout and keyboard Enter-to-calculate support

## Assignment blog and screenshots

See [`BLOG_TEMPLATE.md`](./BLOG_TEMPLATE.md) for the project design, tested demo
results, PSP estimate, and CSDN article draft. The supplied demonstration images
are in [`blog-assets/`](./blog-assets/); upload them through the CSDN editor when
publishing.
