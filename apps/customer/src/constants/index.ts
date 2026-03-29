export const CITIES = [
  { label: 'Dubai (DXB)', value: 'DXB' },
  { label: 'London (LHR)', value: 'LHR' },
  { label: 'Singapore (SIN)', value: 'SIN' },
  { label: 'New York (JFK)', value: 'JFK' },
  { label: 'Paris (CDG)', value: 'CDG' },
];

export const TRAVEL_CLASSES = [
  { label: 'Economy Class', value: 'Economy' },
  { label: 'Business Class', value: 'Business' },
  { label: 'First Class', value: 'First Class' },
];

export const PASSENGER_COUNTS = [
  { label: '1 Passenger', value: '1' },
  { label: '2 Passengers', value: '2' },
  { label: '3 Passengers', value: '3' },
  { label: '4 Passengers', value: '4' },
  { label: '5+ Passengers', value: '5' },
];

export const TRIP_TYPES = [
  { label: 'One Way', value: 'one_way' },
  { label: 'Round Trip', value: 'round_trip' },
  { label: 'Multi City', value: 'multi_city' },
];

export const MOCK_FLIGHTS = [
  {
    id: 'f1',
    airline: 'traveller app Airlines',
    flightNumber: 'SK-101',
    departureTime: '08:45',
    arrivalTime: '16:30',
    departureCity: 'Dubai',
    arrivalCity: 'Singapore',
    departureAirport: 'DXB',
    arrivalAirport: 'SIN',
    duration: '7h 45m',
    stops: 0,
    price: 350,
    currency: 'USD',
    classType: 'Economy',
    tags: ['Best Value', 'Direct'],
  },
  {
    id: 'f2',
    airline: 'FlyJet Airways',
    flightNumber: 'FJ-224',
    departureTime: '11:15',
    arrivalTime: '21:00',
    departureCity: 'Dubai',
    arrivalCity: 'Singapore',
    departureAirport: 'DXB',
    arrivalAirport: 'SIN',
    duration: '9h 45m',
    stops: 1,
    price: 320,
    currency: 'USD',
    classType: 'Economy',
    tags: ['Cheapest'],
  },
  {
    id: 'f3',
    airline: 'AeroJet',
    flightNumber: 'AJ-088',
    departureTime: '23:30',
    arrivalTime: '07:15',
    departureCity: 'Dubai',
    arrivalCity: 'Singapore',
    departureAirport: 'DXB',
    arrivalAirport: 'SIN',
    duration: '7h 45m',
    stops: 0,
    price: 520,
    currency: 'USD',
    classType: 'Business',
    tags: ['Direct'],
  },
];
