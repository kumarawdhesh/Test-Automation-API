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

The fixture contains example domains and applications, dashboard metrics, test suites and cases, releases and cycles, schedules, and source/target connections for PostgreSQL, Snowflake, Oracle, MySQL, and SQL Server. All records are synthetic and intended only for UI demonstrations. Django returns schema and column metadata, generated SQL, and persists cases created through the UI; SQL validation and execution are simulated and do not connect to external databases.

## Django REST API

The `backend/` directory contains a Django REST Framework API, SQLite models, and a seed command that loads synthetic defaults from the same `src/assets/json/demo-data.json` fixture. It supports the UI's legacy `function_name` requests at the matching `/api/<resource>/` paths and at `/api/operations/`. For example:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python -m pip install -r backend\requirements.txt
backend\.venv\Scripts\python backend\manage.py migrate
backend\.venv\Scripts\python backend\manage.py seed_demo
backend\.venv\Scripts\python backend\manage.py createsuperuser
backend\.venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```

Open <http://127.0.0.1:8000/admin/> and sign in with that admin account. Add database types under **Connection types** first, then add connections under **Connections**. Each connection gets an ID automatically and can be enabled or disabled; active connections are included in the UI's connection list. Demo connection records remain available from the fixture.

The admin also exposes every model mapped from `create_ddl_snowflake_unistore.sql` under **Schema api** for add, view, edit, and delete operations. Models with related records prevent deletion until those references are removed.

### UniStore DDL data API

The DDL-backed models use SQLite locally and are exposed as standard JSON CRUD resources under `/api/v1/`; the existing UI-compatible `/api/` operations are unchanged. Each resource supports `GET` list/detail, `POST` create, `PUT`/`PATCH` update, and `DELETE`. Foreign keys use related model IDs, `VARIANT` columns use JSON, and deletion of referenced records returns HTTP 409. Credential fields such as refresh tokens and result password hashes are write-only in the API.

Resources: `app-users`, `bucket-names`, `environments`, `iris-responses`, `test-objects`, `test-object-configs`, `test-case-configs`, `test-suites`, `test-cases`, `test-cycles`, `releases`, `release-test-cycle-mappings`, `test-cycle-case-mappings`, `schedules`, `test-data-generation-audits`, `test-cycle-results`, `test-case-results`, `test-case-result-history`, `test-cycle-result-history`, `multi-steps`, and `multi-step-results`. The browsable API root is <http://127.0.0.1:8000/api/v1/>.

In another PowerShell window, run the UI against Django. The checked-in `.env` and `.env.dev` already configure this; the explicit settings below are useful when overriding them:

```powershell
$env:VITE_DEMO_MODE = "true"
$env:VITE_LOCAL_API_MODE = "true"
$env:VITE_API_BASE_URL = "http://127.0.0.1:8000/api"
npm run start:dev
```

The UI's third-party connections and generated reports are represented by deterministic fixture responses; execution and scheduling are local simulations, not integrations with external services. The API is intended for local development and does not provide production authentication or authorization. Check it with `backend\.venv\Scripts\python backend\manage.py test core`.
