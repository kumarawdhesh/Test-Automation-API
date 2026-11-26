# I Link Automation Tool

React/Vite frontend for exploring test suites, test cases, releases, execution history, reports, and schedules.

## Run the local demo

Requirements: Node.js 18 or newer.

```powershell
npm install
npm start
```

Open <http://localhost:1234>. The local UI uses demo sign-in (`VITE_DEMO_MODE=true`) and sends API requests to the Django backend (`VITE_LOCAL_API_MODE=true`, `VITE_API_BASE_URL=http://127.0.0.1:8000/api`). Both modes are development-only. Set `VITE_LOCAL_API_MODE=false` to use the browser-only fixture API instead. Demo data is loaded from `src/assets/json/demo-data.json`.

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

In another PowerShell window, run the UI against Django. The checked-in `.env` and `.env.dev` already configure this; the explicit settings below are useful when overriding them:

```powershell
$env:VITE_DEMO_MODE = "true"
$env:VITE_LOCAL_API_MODE = "true"
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000/api"
npm run start:dev
```

The UI's third-party connections and generated reports are represented by deterministic fixture responses; execution and scheduling are local simulations, not integrations with external services. The API is intended for local development and does not provide production authentication or authorization. Check it with `backend\.venv\Scripts\python backend\manage.py test core`.
