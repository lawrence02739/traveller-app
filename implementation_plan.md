# Goal Description
Refactor the Flight List and Booking project to maintain proper interfaces and constants, decouple state management (avoiding duplicate seat/baggage calculations), remove Rsuite frame work dependencies, for validations while keeping the old validation logic, and implement exactly 8 core API endpoints correctly applying our dynamic theme style.

## Proposed Changes

### 1. API Integration Structure
We will create a structured API layer under `apps/customer/src/api/` representing the 8 endpoints:
example below ,remaing get the api from the old project
1. `auth.api.ts` -> Handle login API
2. `flight.api.ts` -> Handle Airport List, Preferred Airline, Search (already hitting live endpoint but will be refactored here)
3. `booking.api.ts` -> Handle Review, Seats, Acknowledge, and Confirm Booking

We will replace all inline `fetch`/`axios` calls with these wrapper functions to ensure clean imports. 
We'll create common HTTP utilities that inject the token automatically.

### 2. State & Store Refactoring
Currently, seat calculations and baggage states might be duplicated across multiple components. 
example scenario below check all states and reduce them
We will introduce unified slice states in `apps/customer/src/features/bookingSlice.ts` to manage:
- Selected Flight
- Selected Seats
- Selected Baggage / Add-ons
- Total calculated price

use persistor only users and review api(process stepper relevent)

### 3. Validations & Forms
The old project uses `rsuite/Schema.Model`. We will drop `rsuite` and use robust, native React form validations or custom hooks that align with our dynamic theme (e.g., standard generic `FormField` components with `error` props, or simple validation utility functions sharing the same old rules like required email, passport number length, etc.).
use formik and yup for validations

### 4. Dynamic Theme Implementation
We will avoid any inline styles from the old project. We will strictly use our existing `index.css` Tailwind tokens (e.g., `var(--color-primary)`) to ensure everything respects the light/dark/brand dynamic theming seamlessly.

handle payment well 
don't use inline style
implement responsive upto mobile screenSSS
proper error globaly maitain theme for all component es popups,toast,modals,etc

## Review Required
Does this summary correctly cover everything you meant by "maintain proper interface", "avoid duplicate state calculating seat baggage", "get validation design from that", and mapping the "8 api"? Let me know if I missed any specific API or rule.
