# Skyitix React Vite TypeScript Workspace

A TypeScript monorepo-style workspace with two separate portals:

- `admin` portal
- `customer` portal
- shared `node_modules`
- shared reusable layout/components package
- Tailwind CSS
- ESLint + Husky
- mobile responsive layout
- no extra UI input package

## Run

```bash
npm install
npm run dev:admin
npm run dev:customer
```

## Ports

- Admin: `http://localhost:5173`
- Customer: `http://localhost:5174`

## Structure

```text
apps/
  admin/
  customer/
packages/
  shared/
```

## Theme switching

Customer dashboard supports:

- Gold
- Wine Red
- Blue

The static structure remains shared while the active theme palette changes through shared theme utilities.
