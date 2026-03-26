# Dynamic Filters & UI Polish

- [x] Data Layer Updates
    - [x] Update `Flight` and `PricingOption` types in `flight.ts`
    - [x] Update `FlightState` in `flightSlice.ts` to include `dynamicFilters`
    - [x] Update `flightMapper.ts` to extract `dynamicFilters` from API response
- [x] UI Polish
    - [x] Increase font size for Filters sidebar and Search Header
    - [x] Show Cabin Class (Economy/Premium) in Popup fare list
    - [x] Add Fare Breakdown in Popup (Base, Tax, etc.)
- [x] Dynamic Filtering
    - [x] Implement dynamic categories in `FlightListPage` sidebar
    - [x] Fix multi-city filter mapping ("0", "1")
    - [x] Ensure all filters (Airlines, Price, Stops, Fare Types, Cabin Class) work with the new data
    - [x] Update `SearchSummary` font size as requested
