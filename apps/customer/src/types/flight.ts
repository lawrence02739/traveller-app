export interface PricingOption {
    id: string;
    fare: number;
    fareIdentifier: string;
    sri: string; // Add sri to the mapped segment
    msri: string;
    code: string;
    seats: number;
    class: string;
    price: number;
    netfare: number;
    totalMarkup: number;
    breakdown: {
        baseFare: number;
        adultFare: number;
        taxAndCharges: number;
        userDevelopmentFee: number;
        k3Tax: number;
        airlineMisc: number;
    };
}
interface FareDetails {
    baseFare: number;
    taxAndCharges: number;
    userDevelopmentFee: number;
    k3Tax: number;
    totalFare: number;
    airlineMisc: number;
}
interface AgentMarkupAmount {
    preferredAirlineMarkup: number;
    commonMarkup: number;
    specialFlightDestinationMarkup: number;
}

export interface Flight {
    id: string;
    travelDate: string;
    airline: string;
    icon: string;
    departure: string;
    departureCode: string;
    arrivalCode: string;
    departureCountry: string;
    arrivalCountry: string;
    departureDate: string;
    arrivalDate: string;
    departureLocation: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    durationDetails: string;
    terminalarrival: string;
    terminaldeparture: string;
    flightNumber: string;
    endTerminal: string;
    layoverTime: string;

    arrival: string;

    arrivalLocation: string;
    class: string;
    minprice: string;
    stops: number;
    seats: number;
    fareIdentifier: string;
    allFares: string[];
    pricingOptions: {
        id: string;
        fare: number;
        fareIdentifier: string;
        sri: string; // Add sri to the mapped segment
        msri: string | string[];
        code: string;
        seats: number;
        class: string;
        price: number;
        netfare: number;
        totalMarkup: number;
        totalfare?: number;
        breakdown: {
            agent?: AgentMarkupAmount,
            baseFare: number;
            adultFare: number;
            adult?: FareDetails;
            child?: FareDetails;
            infant?: FareDetails;
            taxAndCharges: number;
            userDevelopmentFee?: number;
            k3Tax?: number;
            airlineMisc?: number;
        };
    }[];
}

export interface IRoundTripFilter {
    airline: string;
    arrival: string;
    arrivalLocation: string;
    class: string;
    departure: string;
    departureLocation: string;

    departureDate: string;
    arrivalDate: string;
    duration: string;
    durationDetails: string;
    icon: string;
    minprice: string;
    seats: number;
    pricingOptions: {
        id: string;
        fare?: string;
        fareIdentifier?: string;
        sri: string; // Add sri to the mapped segment
        msri: string;
        code?: string;
        seats: number;
        class: string;
        price: number;
        netfare: number;
    }[];
}


export interface IIRoundTripFilter {
    airline: string;
    icon: string;
    minprice: string | number; // Supports both string and numeric formats
    segments: {
        airline: string;
        arrival: string;
        arrivalCode: string;
        arrivalDate: string;
        arrivalLocation: string;
        class: string;
        departure: string;
        departureCode: string;
        departureDate: string;
        departureLocation: string;
        duration: string;
        durationDetails: string;
        icon: string;
        minprice: string | number; // Supports both string and numeric formats
        pricingOptions: {
            id: string;
            breakdown?: {
                baseFare: number;
                adultFare: number;
                taxAndCharges: number;
                userDevelopmentFee?: number;
                k3Tax?: number;
            };
            class: string;
            fareIdentifier?: string;
            msri?: string[];
            sri?: string | null;
            netfare: number;
            price: string | number; // Supports both string and numeric formats
            seats: number;
        }[];
    }[];
}

export interface FlightSearchFilters {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
  tripType: 'one_way' | 'round_trip' | 'multi_city';
  paxInfo?: {
    ADULT: number;
    CHILD: number;
    INFANT: number;
  };
  preferredAirline?: string[];
  searchModifiers?: {
    isDirectFlight: boolean;
    isConnectingFlight: boolean;
    pft: string;
  };
  trips?: { origin: string; destination: string; date: string }[];
}

export interface BookingDetails {
  flight: Flight;
  passengers: Passenger[];
  contactInfo: ContactInfo;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  dob: string;
  passportNumber: string;
  seatNumber?: string;
  meal?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface DynamicFilterCategory {
    totalDuration: number[];
    listOfAirLines: string[];
    istOfFareIdentifiers: string[]; // Maintaining user provided typo
    listOfDepartureTerminal: Record<string, string[]>;
    ArrivalTimes: string[];
    listOfCabinClasses: string[];
    listOfFares: number[];
    noOfStops: number[];
    listOfArrivalTerminal: Record<string, string[]>;
    DepartureTimes: string[];
    listOfLayOverDuration?: number[];
    listOfLayOverAirport?: string[];
    stopOverAirports?: string[];
}

export type DynamicFilters = Record<string, DynamicFilterCategory>;
