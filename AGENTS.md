# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a Node.js and Express application using CommonJS. `server.js` serves the browser interface in `public/` and mounts API routers from `routes/`. Business logic lives in `lib/`: orders, inventory, pricing, coupons, tax, invoices, customer ledger, reports, dates, and JSON storage. `config.js` holds shop settings, tax slabs, and coupons; `data/db.json` holds application data. Architecture diagrams are in `docs/`. No test directory exists yet.

## Build, Test, and Development Commands

- `npm install` installs the dependencies listed in `package.json`.
- `npm start` starts the server, using `PORT` or port 3000 by default.
- `node --test` runs Node's built-in test runner when tests are added.
- `npm test` runs a placeholder script that prints an error and exits unsuccessfully.

There is no build script or configured linting tool.

## Coding Style & Naming

Follow the existing JavaScript style: two-space indentation, semicolons, single quotes, `var`, and CommonJS `require`/`exports`. Use descriptive lowercase module names, such as `lib/inventory.js`, and camelCase for functions and variables. Keep route handling in `routes/` and business logic in `lib/`.

## Testing Guidelines

Before changing behavior, write characterization tests that record what the code does today, including behavior that looks wrong. Use `node:test`, descriptive test names, and in-memory fixtures; tests must never read or write `data/db.json`. Run `node --test`. No coverage threshold is configured.

## Change and Review Guidelines

For a ticket, change only the module it concerns. Add no dependencies. Recent commit subjects are short, lowercase descriptions of the change, such as `invoice page for accountant`; follow that pattern. Pull requests should explain the change, link the relevant issue when available, and include test results. Add screenshots for visible interface changes.

## Security & Configuration

Treat `data/db.json` as application data, not a test fixture. `config.js` contains a hard-coded admin key; avoid exposing keys or personal data in screenshots or shared logs.
