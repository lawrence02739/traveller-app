import { Flight } from '../types/flight';

/**
 * Formats minutes into "Xh Ym"
 */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formats ISO datetime string to HH:MM
 */
function formatTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Parses raw flight data from API/JSON into common Flight[] structure
 */
export function parseFlightData(rawFlightList: any[]): Flight[] {
  if (!rawFlightList || !Array.isArray(rawFlightList)) return [];

  return rawFlightList.map((flightRaw, idx) => {
    const segments = flightRaw.sI || [];
    const totalPriceList = flightRaw.totalPriceList || [];

    if (segments.length === 0) return null;

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    // Compute total duration
    const totalDurationMins = firstSegment.duration || 0; 
    
    const pricingOptions: any[] = totalPriceList.map((tp: any) => {
      const adultFare = tp.fd?.ADULT?.fC || {};
      const adultFareDetails = tp.fd?.ADULT || {};
      const totalPriceModel = tp.fd?.totalPriceModel || {};
      
      return {
        id: tp.id,
        fare: adultFare.TF || 0,
        fareIdentifier: tp.fareIdentifier || 'PUBLISHED',
        sri: tp.sri || '',
        msri: tp.msri || [],
        code: adultFareDetails.cB || '',
        seats: adultFareDetails.sR || 0,
        class: adultFareDetails.cc || 'ECONOMY',
        price: totalPriceModel.price || adultFare.TF || 0,
        netfare: totalPriceModel.netFare || adultFare.NF || 0,
        totalMarkup: totalPriceModel.platformMarkupBreakdown?.totalMarkup || 0,
        totalfare: totalPriceModel.price || adultFare.TF || 0,
        breakdown: {
          agent: {
            preferredAirlineMarkup: 0,
            commonMarkup: 0,
            specialFlightDestinationMarkup: 0
          },
          baseFare: adultFare.BF || 0,
          adultFare: adultFare.TF || 0,
          taxAndCharges: adultFare.TAF || 0,
          userDevelopmentFee: 0,
          k3Tax: 0,
          airlineMisc: 0,
          adult: {
             baseFare: adultFare.BF || 0,
             taxAndCharges: adultFare.TAF || 0,
             totalFare: adultFare.TF || 0,
             userDevelopmentFee: 0,
             k3Tax: 0,
             airlineMisc: 0
          },
          child: { baseFare: 0, taxAndCharges: 0, totalFare: 0, userDevelopmentFee: 0, k3Tax: 0, airlineMisc: 0 },
          infant: { baseFare: 0, taxAndCharges: 0, totalFare: 0, userDevelopmentFee: 0, k3Tax: 0, airlineMisc: 0 }
        }
      };
    });

    const prices = pricingOptions.map(p => p.price);
    const minprice = prices.length > 0 ? Math.min(...prices) : 0;
    const defaultSeats = pricingOptions.length > 0 ? pricingOptions[0].seats : 0;
    const defaultClass = pricingOptions.length > 0 ? pricingOptions[0].class : 'ECONOMY';

    return {
      id: flightRaw.id || `flight-${idx}-${firstSegment.id}`,
      travelDate: firstSegment.dt,
      airline: firstSegment.fD?.aI?.name || 'Unknown',
      icon: firstSegment.fD?.aI?.code || '',
      departure: firstSegment.da?.name || '',
      departureCode: firstSegment.da?.code || '',
      arrivalCode: lastSegment.aa?.code || '',
      departureCountry: firstSegment.da?.country || '',
      arrivalCountry: lastSegment.aa?.country || '',
      departureDate: firstSegment.dt,
      arrivalDate: lastSegment.at,
      departureLocation: firstSegment.da?.city || '',
      departureTime: formatTime(firstSegment.dt),
      arrivalTime: formatTime(lastSegment.at),
      duration: formatDuration(totalDurationMins),
      durationDetails: formatDuration(totalDurationMins),
      terminaldeparture: firstSegment.da?.terminal || '',
      terminalarrival: lastSegment.aa?.terminal || '',
      flightNumber: `${firstSegment.fD?.aI?.code}-${firstSegment.fD?.fN}`,
      endTerminal: lastSegment.aa?.terminal || '',
      layoverTime: '',
      arrival: lastSegment.aa?.name || '',
      arrivalLocation: lastSegment.aa?.city || '',
      class: defaultClass,
      minprice: minprice.toString(),
      stops: segments.length - 1,
      seats: defaultSeats,
      fareIdentifier: pricingOptions[0]?.fareIdentifier || 'PUBLISHED',
      allFares: Array.from(new Set(pricingOptions.map(p => p.fareIdentifier))),
      pricingOptions
    } as Flight;
  }).filter(Boolean) as Flight[];
}

