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
    seats: number;
    pricingOptions: {
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
        totalfare: number;
        breakdown: {
            agent: AgentMarkupAmount,
            baseFare: number;
            adultFare: number;
            adult: FareDetails;
            child: FareDetails;
            infant: FareDetails;
            taxAndCharges: number;
            userDevelopmentFee: number;
            k3Tax: number;
            airlineMisc: number;
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
