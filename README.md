# I Link Automation Tool

React/Vite frontend for exploring test suites, test cases, releases, execution history, reports, and schedules.

## Run the local demo

Requirements: Node.js 18 or newer.

```powershell
npm install
npm start
```

Open <http://localhost:1234>. Local demo mode is enabled by `VITE_DEMO_MODE=true` in `.env`. It is only active in Vite development mode; production builds always use the configured API. Demo data is loaded from `src/assets/json/demo-data.json`. Changes made in the UI are simulated in browser memory and reset on refresh.

## Build and tests

```powershell
npm run build
npm test -- --runInBand src/components/Footer/Footer.test.js
```

## Demo data

The fixture contains example domains and applications, dashboard metrics, test suites and cases, releases and cycles, schedules, database connections, schemas, and table columns. All records are synthetic and intended only for UI demonstrations.

## Django REST API

The `backend/` directory contains a Django REST Framework API, SQLite models, and a seed command that loads synthetic defaults from the same `src/assets/json/demo-data.json` fixture. It supports the UI's legacy `function_name` requests at the matching `/api/<resource>/` paths and at `/api/operations/`. For example:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python -m pip install -r backend\requirements.txt
backend\.venv\Scripts\python backend\manage.py migrate
backend\.venv\Scripts\python backend\manage.py seed_demo
backend\.venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```

In another PowerShell window, run the UI against Django instead of its in-memory demo:

```powershell
$env:VITE_DEMO_MODE = "false"
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000/api"
npm run start:dev
```

The UI's third-party connections and generated reports are represented by deterministic fixture responses; execution and scheduling are local simulations, not integrations with external services. The API is intended for local development and does not provide production authentication or authorization. Check it with `backend\.venv\Scripts\python backend\manage.py test core`.
