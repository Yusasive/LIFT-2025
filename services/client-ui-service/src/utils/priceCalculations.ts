// utils/priceCalculations.ts
import { INDOOR_PRICING, OUTDOOR_PRICING, PREMIUM_OUTDOOR_PRICING, MINIMUM_REQUIREMENTS } from '../pages/Dashboard/exhibitor/shared/components/BoothsData/pricingConfig';

interface BoothInfo {
  boothId: string;
  sqm: number;
  locationName?: string;
  locationType?: 'hall' | 'sector';
  category?: 'Standard' | 'Premium';
}

interface LocationGroup {
  locationName: string;
  locationType: 'hall' | 'sector';
  booths: BoothInfo[];
  totalSqm: number;
  boothIds: string[];
}

export const getLocationType = (locationName: string, booths: any[]): 'indoor' | 'outdoor' | 'premium-outdoor' => {
  const isHall = locationName.toLowerCase().includes('hall');
  const isSector = ['fda', 'hct', 'eei', 'cga', 'ta', 'rbf', 'cog', 'oth'].some(
    sector => locationName.toLowerCase().includes(sector.toLowerCase())
  );
  
  if (isHall) {
    return 'indoor';
  }
  
  if (isSector) {
    const hasPremium = booths.some(booth => booth.category === 'Premium');
    return hasPremium ? 'premium-outdoor' : 'outdoor';
  }
  
  return 'indoor';
};

export const calculatePackagePrice = (totalSqm: number, locationType: string, booths?: any[]): number | null => {
  const actualLocationType = booths ? getLocationType(locationType, booths) : 'indoor';
  
  const pricingTable = 
    actualLocationType === 'indoor' ? INDOOR_PRICING :
    actualLocationType === 'premium-outdoor' ? PREMIUM_OUTDOOR_PRICING :
    OUTDOOR_PRICING;
  
  if (pricingTable[totalSqm]) {
    return pricingTable[totalSqm].price;
  }
  
  return null;
};

export const groupBoothsByLocation = (selectedBooths: { [key: string]: any }): { [key: string]: LocationGroup } => {
  const selections = Object.entries(selectedBooths);
  
  return selections.reduce((acc, [boothId, booth]) => {
    const locationKey = booth.locationName || 'Africa Hall';
    
    if (!acc[locationKey]) {
      acc[locationKey] = {
        locationName: locationKey,
        locationType: booth.locationType || 'hall',
        booths: [],
        totalSqm: 0,
        boothIds: []
      };
    }
    
    acc[locationKey].booths.push({ boothId, ...booth });
    acc[locationKey].totalSqm += booth.sqm;
    acc[locationKey].boothIds.push(boothId);
    
    return acc;
  }, {} as { [key: string]: LocationGroup });
};

export const calculateTotalAmount = (selectedBooths: { [key: string]: any }): number => {
  const groupedSelections = groupBoothsByLocation(selectedBooths);
  
  return Object.values(groupedSelections).reduce((total, locationData) => {
    const packagePrice = calculatePackagePrice(
      locationData.totalSqm, 
      locationData.locationType, 
      locationData.booths
    );
    return total + (packagePrice || 0);
  }, 0);
};

export const getBoothBreakdown = (selectedBooths: { [key: string]: any }) => {
  const groupedSelections = groupBoothsByLocation(selectedBooths);
  
  return Object.entries(groupedSelections).map(([location, data]) => {
    const packagePrice = calculatePackagePrice(data.totalSqm, data.locationType, data.booths);
    
    return {
      location,
      ...data,
      packagePrice,
      isValid: data.totalSqm >= MINIMUM_REQUIREMENTS[getLocationType(data.locationName, data.booths)]
    };
  });
};