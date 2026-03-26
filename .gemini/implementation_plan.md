# Fix Booking Flow and ESLint

Restore the recently reverted code changes in `FlightListPage.tsx` and `BookingFlowPage.tsx` while resolving an ESLint configuration error.

## User Review Required

> [!IMPORTANT]
> - Renaming `eslint.config.js` to `eslint.config.mjs` to support ESM syntax in ESLint 9.
> - Updating `package.json` lint script to remove `--ext` flag.

## Proposed Changes

### Configuration

#### [MODIFY] [package.json](file:///c:/Users/lawrencec/Downloads/skyitix-microservice-template-ts/skyitix-ts/package.json)
- Update `lint` script to `eslint .`

#### [NEW] [eslint.config.mjs](file:///c:/Users/lawrencec/Downloads/skyitix-microservice-template-ts/skyitix-ts/eslint.config.mjs)
- Rename from `eslint.config.js` to enable ESM support.

#### [DELETE] [eslint.config.js](file:///c:/Users/lawrencec/Downloads/skyitix-microservice-template-ts/skyitix-ts/eslint.config.js)
- Replaced by `.mjs` version.

---

### Customer App UI

#### [MODIFY] [FlightListPage.tsx](file:///c:/Users/lawrencec/Downloads/skyitix-microservice-template-ts/skyitix-ts/apps/customer/src/pages/FlightListPage.tsx)
- Increase font size for Filters header and Summary Header (origin/destination).
- Reduce padding and font size for flight cards and popup details (+ show breakdown in popup).
- Ensure Cabin Class (Economy, Premium, etc.) is prominently displayed in the list.
- Fix dynamic filters for different trip types (Multi-city leg indexing).

#### [MODIFY] [BookingFlowPage.tsx](file:///c:/Users/lawrencec/Downloads/skyitix-microservice-template-ts/skyitix-ts/apps/customer/src/pages/BookingFlowPage.tsx)
- Add robust safety checks for `selectedFlights` and `filters`.
- Ensure all selected segments are included in the review/validation step.

## Verification Plan

### Automated Tests
- `npm run lint` should execute without ESM syntax errors.

### Manual Verification
- Verify the booking flow from search to payment.
- Check aesthetic changes in `FlightListPage` and `selectedPopup`.
