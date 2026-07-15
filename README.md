# TradeGrid

TradeGrid is an MVP-ready full-stack prototype for Malaysian SME exporters. It guides users through a shipment workflow, records real compliance evidence statuses, generates a traceable rules-based checklist, previews export documents, and produces downloadable Commercial Invoice and Packing List PDFs.

## Features

- Responsive B2B dashboard and public landing page
- Four-step shipment form with validation
- Checklist rules for transport mode, preferential tariffs, product category, and HS code
- Traceable Malaysian export rules for Customs K2 declarations, prohibited/restricted goods screening, ATIGA origin/Form D, Strategic Trade Act permits, and MAQIS checks
- Official-source register with ruleset version and last-verified date
- Editable compliance review for K2 filing, carrier documents, ATIGA origin evidence, MITI permits, and MAQIS outcomes
- Readiness recalculation only after external documents are recorded as filed, accepted, issued, or otherwise verified
- Visible API success and failure feedback, server-side business validation, confirmed deletion, and atomic JSON writes
- Commercial Invoice and Packing List previews with accurate totals
- Server-generated PDF downloads
- JSON-file persistence and two seeded example shipments
- Mock assistant with concise, safety-scoped guidance
- Complete shipment CRUD API

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:3001`.

For a production build:

```bash
npm run build
npm run server
```

The Express server serves the built frontend and API on `http://localhost:3001`.

## API

- `GET /api/shipments`
- `GET /api/regulations`
- `GET /api/shipments/:id`
- `POST /api/shipments`
- `PUT /api/shipments/:id`
- `DELETE /api/shipments/:id`
- `POST /api/shipments/:id/generate-documents`
- `GET /api/shipments/:id/checklist`
- `GET /api/shipments/:id/pdf/commercial-invoice`
- `GET /api/shipments/:id/pdf/packing-list`

Data is saved to `server/data/shipments.json` when the API starts. This is a prototype and does not submit to customs or provide legal advice.

## Regulatory scope

The rules engine is based on public guidance from Royal Malaysian Customs, MITI, MATRADE, and MAQIS. Ruleset `MY-EXPORT-2026.07.2` was last reviewed on 15 July 2026. It distinguishes prepared internal documents from externally filed or issued evidence, and supports Form D/e-Form D plus ASEAN-Wide Self-Certification origin declarations. It does not copy legislation, determine an authoritative HS classification, submit K2 declarations, issue permits, or guarantee destination-country clearance. Always verify the exact product, HS code, end-user, and importing-country requirements with the responsible authority or appointed agent.
