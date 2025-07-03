// Enhanced BoothManagement.tsx Integration - Updated sections for Phase 3

  import React, { useState, useCallback } from 'react';
import { useValidationEngine } from './hooks/useValidationEngine';
import { getEnhancedBoothsForLocation } from './components/BoothsData/boothDataManager';
// import { hallAConfig } from './components/BoothsData/layouts/hallAConfig';
// import PassageOverlay from './components/PassageOverlay';
// import BoothValidationIndicator from './components/BoothValidationIndicator';
// import SmartSelectionHints from './components/SmartSelectionHints';
import { INDOOR_PRICING, OUTDOOR_PRICING, PREMIUM_OUTDOOR_PRICING, MINIMUM_REQUIREMENTS } from './components/BoothsData/pricingConfig';
import EnhancedLayoutDisplay from './components/EnhancedLayoutDisplay';
// import { calculatePackagePrice, groupBoothsByLocation } from '../../../../utils/priceCalculations';
// Enhanced UnifiedInteractiveLayout component with Phase 3 features
interface BoothData {
  coords: number[][];
  status: 'available' | 'selected' | 'booked-by-you' | 'booked-by-others';
  size: string;
  category: 'Standard' | 'Premium';
  price: number;
  sqm: number;
  boothId?: string; // Optional, can be used for unique identification
}
interface SelectedBoothExtended extends BoothData {
  selectedAt: string;
  locationName: string;
  locationType: 'hall' | 'sector';
}
interface SelectedBooth extends BoothData {
  selectedAt: string;
}
interface BoothSelections {
  [boothId: string]: SelectedBooth;
}
const EnhancedUnifiedInteractiveLayout: React.FC<{
  layoutData: {
    name: string;
    title: string;
    type: 'hall' | 'sector';
     boothTypes?: Array<{
      size: string;
      count: number;
      description: string;
      range: string;
    }>;
    color: string;
    boothCount: number;
    description: string;
    imageSrc: string;
    existingBooths?: { [key: string]: any };
    ratePerSqm: number;
  };
  onClose: () => void;
  selectedBooths: any;
  feedback: any;
  onBoothClick: (boothId: string) => void;
  onRemoveBooth: (boothId: string) => void;
  onExport: () => void;
  onSave: () => void;
  onClearAll: () => void;
  onCompleteReservation?: () => void;
}> = ({
  layoutData,
  onClose,
  selectedBooths,
  feedback,
  onBoothClick,
  onRemoveBooth,
  onExport,
  onSave,
  onClearAll,
  onCompleteReservation
}) => {
  
  // Enhanced state management
  // const [showPassageLabels, setShowPassageLabels] = useState(true);
  const [showValidationHints] = useState(true);
  const [showAdvancedFeedback] = useState(true);
  // const [highlightValidBooths, setHighlightValidBooths] = useState(true);
  // const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Get enhanced booth data with validation metadata
  const enhancedBooths = React.useMemo(() => {
    if (!layoutData.existingBooths) return {};
    return getEnhancedBoothsForLocation(layoutData.name);
  }, [layoutData.name, layoutData.existingBooths]);

  // Initialize validation engine
  const {
    validateBoothSelection,
    getValidNextBooths,
    getSuggestedBooths,
    getBlockedBooths,
    getSelectionAnalysis,
    // getValidationSummary,
    getFormattedError,
    getUserMessage,
    layoutConfig,
    isConfigured,
    // lastValidationResult
  } = useValidationEngine({
    locationName: layoutData.name,
    validationMode: 'strict',
    enableRealTimeValidation: true,
    enableSmartSuggestions: true
  });

  // Current selections as array
  const currentSelections = Object.keys(selectedBooths);

  // Get validation state sets
  const validNextBooths = React.useMemo(() => 
    new Set(getValidNextBooths(currentSelections)), 
    [getValidNextBooths, currentSelections]
  );

  const suggestedBooths = React.useMemo(() => 
    new Set(getSuggestedBooths(currentSelections)), 
    [getSuggestedBooths, currentSelections]
  );

  const blockedBooths = React.useMemo(() => 
    new Set(getBlockedBooths(currentSelections)), 
    [getBlockedBooths, currentSelections]
  );

  // Get analysis data
  const selectionAnalysis = React.useMemo(() => 
    getSelectionAnalysis(), 
    [getSelectionAnalysis, currentSelections]
  );

  // const validationSummary = React.useMemo(() => 
  //   getValidationSummary(currentSelections), 
  //   [getValidationSummary, currentSelections]
  // );

  // Enhanced booth click handler with validation
  const handleBoothClick = useCallback((boothId: string) => {
    if (!isConfigured) {
      console.warn('Validation engine not configured, proceeding without validation');
      onBoothClick(boothId);
      return;
    }

    // Check if booth is already selected
    if (selectedBooths[boothId]) {
      onBoothClick(boothId); // Will remove the booth
      return;
    }

    // Validate the selection
    const validationResult = validateBoothSelection(currentSelections, boothId);
    
    if (validationResult.isValid) {
      onBoothClick(boothId); // Proceed with selection
    } else {
      // Show validation error
      const formattedError = getFormattedError(validationResult);
      const userMessage = getUserMessage(boothId, currentSelections, validationResult);
      
      // You could show this in a toast/notification
      console.log('Validation failed:', formattedError);
      alert(userMessage); // Temporary - replace with proper notification
    }
  }, [isConfigured, selectedBooths, validateBoothSelection, currentSelections, onBoothClick, getFormattedError, getUserMessage]);

  // Handle smart hint actions
  // const handleBoothSuggestionClick = useCallback((boothId: string) => {
  //   handleBoothClick(boothId);
  // }, [handleBoothClick]);

  // const handleOptimizationClick = useCallback((action: string) => {
  //   console.log('Optimization action:', action);
  //   // Implement optimization actions based on the action type
  // }, []);

  // Check if layout has booth coordinates
  const hasExistingBooths = layoutData.existingBooths && Object.keys(layoutData.existingBooths).length > 0;

  // Only render enhanced features if we have booth data and validation is configured
  const canShowEnhancedFeatures = hasExistingBooths && isConfigured && layoutConfig;

  return (
    <div className="">
      {/* Header */}
      {/* <div 
        className="inline-block text-white px-5 py-3 rounded-full font-bold text-lg"
        style={{ backgroundColor: layoutData.color }}
      > */}
        {/* {layoutData.type === 'hall' ? '🏛️' : '📍'} {layoutData.title} - {layoutData.boothCount} Exhibition Booths */}
        {/* {canShowEnhancedFeatures && (
          <span className="ml-2 text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
            ✨ Smart Selection Enabled
          </span>
        )} */}
      {/* </div> */}

      <button 
        onClick={onClose}
        className="bg-gray-500 text-white px-5 py-2 border-none rounded cursor-pointer mb-5 font-bold hover:bg-gray-600 transition-all duration-200"
      >
        ← Back to Site Plan
      </button>

      {/* Enhanced Controls */}
      {/* {canShowEnhancedFeatures && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Display Options</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showPassageLabels}
                onChange={(e) => setShowPassageLabels(e.target.checked)}
                className="rounded"
              />
              <span>Passage Labels</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showValidationHints}
                onChange={(e) => setShowValidationHints(e.target.checked)}
                className="rounded"
              />
              <span>Smart Hints</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={highlightValidBooths}
                onChange={(e) => setHighlightValidBooths(e.target.checked)}
                className="rounded"
              />
              <span>Highlight Valid</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showAdvancedFeedback}
                onChange={(e) => setShowAdvancedFeedback(e.target.checked)}
                className="rounded"
              />
              <span>Advanced Feedback</span>
            </label>
          </div>
        </div>
      )} */}

      {/* Smart Selection Hints */}
      {canShowEnhancedFeatures && showValidationHints && (
        ''
        // <SmartSelectionHints
        //   currentSelections={currentSelections}
        //   validNextBooths={Array.from(validNextBooths)}
        //   suggestedBooths={Array.from(suggestedBooths)}
        //   selectionAnalysis={selectionAnalysis}
        //   validationSummary={validationSummary}
        //   lastValidationResult={lastValidationResult}
        //   onBoothSuggestionClick={handleBoothSuggestionClick}
        //   onOptimizationClick={handleOptimizationClick}
        //   showAdvancedHints={showAdvancedFeedback}
        //   position="top"
        // />
      )
      }

      {/* Selection Summary */}
    

      {/* Enhanced Booth Legend */}
      {hasExistingBooths && <EnhancedBoothLegend showValidationStates={!!canShowEnhancedFeatures} />}

      {/* Description */}
      <div className="leading-relaxed mb-5 text-gray-600">
        {/* {layoutData.description}
        {canShowEnhancedFeatures && (
          <div className="mt-2 text-sm text-blue-600">
            ✨ <strong>Smart Selection Active:</strong> Booths are color-coded based on validation rules. 
            Suggested booths pulse with recommendations, blocked booths are grayed out.
          </div>
        )} */}
      </div>

      {/* Feedback Message */}
      <FeedbackMessage feedback={feedback} />

      {/* Layout Display */}
         <div className="bg-gray-50 rounded-lg p-5">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          📐 Enhanced Interactive Booth Layout
          <span className="ml-2 text-sm text-blue-600">
            ✨ Multi-size • Zoom • Pan • Fullscreen
          </span>
        </h4>
        
        <EnhancedLayoutDisplay
          layoutData={layoutData}
          enhancedBooths={enhancedBooths}
          currentSelections={currentSelections}
          validNextBooths={validNextBooths}
          suggestedBooths={suggestedBooths}
          blockedBooths={blockedBooths}
          onBoothClick={handleBoothClick}
          showPassageOverlay={!!canShowEnhancedFeatures}
          layoutConfig={layoutConfig}
        />
      </div>
        {hasExistingBooths && (
        <SelectionSummary
          selectedBooths={selectedBooths}
          onRemoveBooth={onRemoveBooth}
          onExport={onExport}
          onSave={onSave}
          onClearAll={onClearAll}
          onCompleteReservation={onCompleteReservation}
          currentLocationName={layoutData.name}
          currentLocationType={layoutData.type}
        />
      )}
      {/* Booth Types Display */}
      {layoutData.boothTypes && (
        <div className="bg-gray-100 rounded-lg p-5">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 Available Booth Types</h4>
          <div className={`grid gap-4 ${layoutData.boothTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {layoutData.boothTypes.map((boothType, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg text-center border-2 ${
                  boothType.size.includes('6m²') 
                    ? 'bg-green-100 border-green-600' 
                    : 'bg-red-100 border-red-600'
                }`}
              >
                <h5 className="font-semibold mb-2">{boothType.size}</h5>
                <p><strong>{boothType.count} Booths Available</strong></p>
                <p>{boothType.description}</p>
                <small className="text-gray-600">{boothType.range}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Analytics (Phase 3 Enhancement) */}
      {canShowEnhancedFeatures && showAdvancedFeedback && selectionAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">📊 Selection Analytics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column Analysis */}
            <div className="bg-white rounded-lg p-3 border">
              <h6 className="text-sm font-semibold text-gray-700 mb-2">Column Status</h6>
              <div className="text-xs text-gray-600">
                <div>Current: {selectionAnalysis.columnAnalysis?.currentColumns?.join(', ') || 'None'}</div>
                <div>Type: {selectionAnalysis.columnAnalysis?.restrictionType || 'None'}</div>
                <div>Max Reached: {selectionAnalysis.columnAnalysis?.maxSelectionsReached ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Passage Analysis */}
            <div className="bg-white rounded-lg p-3 border">
              <h6 className="text-sm font-semibold text-gray-700 mb-2">Passage Risk</h6>
              <div className="text-xs text-gray-600">
                <div>Risk Level: 
                  <span className={`ml-1 font-semibold ${
                    selectionAnalysis.passageAnalysis?.crossingRisk === 'high' ? 'text-red-600' :
                    selectionAnalysis.passageAnalysis?.crossingRisk === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {selectionAnalysis.passageAnalysis?.crossingRisk || 'Low'}
                  </span>
                </div>
                <div>Affected: {selectionAnalysis.passageAnalysis?.affectedPassages?.length || 0} passages</div>
              </div>
            </div>

            {/* Sequential Analysis */}
            <div className="bg-white rounded-lg p-3 border">
              <h6 className="text-sm font-semibold text-gray-700 mb-2">Pattern</h6>
              <div className="text-xs text-gray-600">
                <div>Type: {selectionAnalysis.sequentialAnalysis?.pattern?.type || 'None'}</div>
                <div>Continuity: {selectionAnalysis.sequentialAnalysis?.continuity?.isValid ? 'Good' : 'Gaps Found'}</div>
                <div>Efficiency: {Math.round((selectionAnalysis.sequentialAnalysis?.pathEfficiency || 0) * 100)}%</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-3 border">
              <h6 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h6>
              <div className="text-xs text-gray-600">
                {selectionAnalysis.recommendations?.slice(0, 2).map((rec: string, index: number) => (
                  <div key={index} className="mb-1">• {rec.substring(0, 40)}...</div>
                )) || <div>No issues found</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div 
        className="text-white p-5 rounded-lg text-center"
        style={{ backgroundColor: layoutData.color }}
      >
        <strong>
          {hasExistingBooths 
            ? `🏛️ Ready to book ${layoutData.name}?`
            : `📍 Use the coordinate picker to define booths for ${layoutData.name}`
          }
        </strong><br /><br />
        {hasExistingBooths 
          ? (canShowEnhancedFeatures 
              ? 'Use the enhanced interactive layout with smart suggestions to select your optimal booths, then proceed to booking.'
              : 'Use the interactive booth layout above to select your preferred booths, then use the export function to generate your booking request.')
          : 'Start by activating the coordinate picker and drawing booth boundaries on the layout image.'
        }<br /><br />
        <strong>Indoor Rate: ₦{layoutData.ratePerSqm.toLocaleString()}/m²</strong>
      </div>
    </div>
  );
};

// Enhanced Booth Legend with validation states
const EnhancedBoothLegend: React.FC<{ showValidationStates?: boolean }> = ({ 
  showValidationStates = false 
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-5">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">🎨 Booth Status Legend</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* Basic States */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 border border-gray-600 bg-red-200 bg-opacity-60"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 border border-gray-600 bg-green-300 bg-opacity-60"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 border border-gray-600 bg-blue-300 bg-opacity-60"></div>
          <span>Booked by You</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 border border-gray-600 bg-red-300 bg-opacity-60"></div>
          <span>Booked by Others</span>
        </div>
      </div>

      {/* Enhanced Validation States */}
      {showValidationStates && (
        <>
          <h5 className="text-lg font-semibold text-gray-800 mb-3">🎯 Smart Selection States</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 border-2 border-violet-600 bg-violet-200 bg-opacity-60"></div>
              <span>Valid Next</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 border-2 border-amber-500 bg-amber-100 bg-opacity-70 animate-pulse"></div>
              <span>Recommended</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 border border-gray-400 bg-gray-100 bg-opacity-30" style={{ borderStyle: 'dashed' }}></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 border border-red-500 bg-red-50 bg-opacity-30" style={{ borderStyle: 'dotted' }}></div>
              <span>Invalid</span>
            </div>
          </div>

          {/* <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-800">
              <strong>Smart Features:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Recommended booths pulse with golden highlights</li>
                <li>Valid next options are highlighted in purple</li>
                <li>Blocked connections show warning indicators</li>
                <li>Passage boundaries are clearly marked</li>
              </ul>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
};

// const BoothPolygon: React.FC<{
//   boothId: string;
//   booth: BoothData;
//   onBoothClick: (boothId: string) => void;
// }> = ({ boothId, booth, onBoothClick }) => {
//   const points = booth.coords.map(coord => coord.join(',')).join(' ');
//   const centerX = booth.coords.reduce((sum, coord) => sum + coord[0], 0) / booth.coords.length;
//   const centerY = booth.coords.reduce((sum, coord) => sum + coord[1], 0) / booth.coords.length;

//   const getBoothClasses = () => {
//     const baseClasses = "cursor-pointer transition-all duration-300 hover:opacity-80 hover:stroke-[3] hover:filter hover:drop-shadow-lg";
    
//     switch (booth.status) {
//       case 'available':
//         return `${baseClasses} fill-red-200 fill-opacity-30 stroke-gray-600`;
//       case 'selected':
//         return `${baseClasses} fill-green-300 fill-opacity-60 stroke-green-500`;
//       case 'booked-by-you':
//         return `${baseClasses} fill-blue-300 fill-opacity-60 stroke-blue-700`;
//       case 'booked-by-others':
//         return `${baseClasses} fill-red-300 fill-opacity-60 stroke-red-700`;
//       default:
//         return baseClasses;
//     }
//   };

//   return (
//     <g>
//       <polygon
//         points={points}
//         className={getBoothClasses()}
//         strokeWidth="1"
//         onClick={(e) => {
//           e.stopPropagation();
//           onBoothClick(boothId);
//         }}
//       />
//       <text
//         x={centerX}
//         y={centerY}
//         className="text-6xl font-blue-500 font-extrabold  pointer-events-none "
//         textAnchor="middle"
//         dominantBaseline="middle"
//       >
//         {booth.boothId}
//       </text>
//     </g>
//   );
// };

const FeedbackMessage: React.FC<{
  feedback: {message: string; type: 'success' | 'error' | 'removal'} | null;
}> = ({ feedback }) => {
  if (!feedback) return null;

  const getClasses = () => {
    const baseClasses = "bg-opacity-90 border rounded p-2 mb-2 text-center font-bold transition-all duration-300";
    switch (feedback.type) {
      case 'success':
        return `${baseClasses} bg-green-200 border-green-600 text-green-700`;
      case 'error':
        return `${baseClasses} bg-red-200 border-red-600 text-red-700`;
      case 'removal':
        return `${baseClasses} bg-yellow-200 border-yellow-600 text-yellow-800`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={getClasses()}>
      {feedback.message}
    </div>
  );
};

const SelectionSummary: React.FC<{
  selectedBooths: BoothSelections;
  onRemoveBooth: (boothId: string) => void;
  onExport: () => void;
  onSave: () => void;
  onClearAll: () => void;
  onCompleteReservation?: () => void;
  currentLocationName?: string;
  currentLocationType?: 'hall' | 'sector';
}> = ({ 
  selectedBooths, 
  onRemoveBooth, 
  // onExport, 
  // onSave, 
  onClearAll,
  onCompleteReservation,
  currentLocationName = 'Africa Hall',
  currentLocationType = 'hall'
}) => {
  const selections = Object.entries(selectedBooths);
  
  if (selections.length === 0) return null;

  // Helper functions - define them inside the component

 // In the getEntitlements function, return with proper typing
const getEntitlements = (totalSqm: number, locationType: string, booths?: any[]) => {
  const actualLocationType = booths ? getLocationType(locationType, booths) : 'indoor';
  
  const pricingTable = 
    actualLocationType === 'indoor' ? INDOOR_PRICING :
    actualLocationType === 'premium-outdoor' ? PREMIUM_OUTDOOR_PRICING :
    OUTDOOR_PRICING;
  
  const pricing = pricingTable[totalSqm];
  if (!pricing) return null;
  
  // Return with optional furniture property
  return {
    ...pricing,
    furniture: actualLocationType === 'indoor' ? (pricing as any).furniture : undefined
  };
};

 // In SelectionSummary, update the getLocationType function:
const getLocationType = (locationName: string, booths: any[]): 'indoor' | 'outdoor' | 'premium-outdoor' => {
  // Check if it's a hall (indoor) or sector (outdoor)
  const isHall = locationName.toLowerCase().includes('hall');
  const isSector = ['fda', 'hct', 'eei', 'cga', 'ta', 'rbf', 'cog', 'oth'].some(
    sector => locationName.toLowerCase().includes(sector.toLowerCase())
  );
  
  if (isHall) {
    return 'indoor'; // All halls are indoor
  }
  
  if (isSector) {
    // Check if any booth is premium for outdoor sectors
    const hasPremium = booths.some(booth => booth.category === 'Premium');
    return hasPremium ? 'premium-outdoor' : 'outdoor';
  }
  
  // Default to indoor if unclear
  return 'indoor';
};

  const calculatePackagePrice = (totalSqm: number, locationType: string, booths?: any[]): number | null => {
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

  const validateMinimumRequirement = (totalSqm: number, locationType: string, booths?: any[]): {
    isValid: boolean;
    message: string;
  } => {
    const actualLocationType = booths ? getLocationType(locationType, booths) : 'indoor';
    const minimum = MINIMUM_REQUIREMENTS[actualLocationType];
    
    if (totalSqm < minimum) {
      return {
        isValid: false,
        message: `Below minimum (${minimum}m² required)`
      };
    }
    
    return {
      isValid: true,
      message: 'Valid'
    };
  };

  const isAllSelectionsValid = (groupedSelections: Record<string, any>): boolean => {
    return Object.values(groupedSelections).every(data => {
      const validation = validateMinimumRequirement(data.totalSqm, data.locationType, data.booths);
      return validation.isValid;
    });
  };

  // Group selections by location
 const groupedSelections = selections.reduce((acc, [boothId, booth]) => {
  // Now booth should have locationName and locationType
  const boothData = booth as SelectedBoothExtended;
  const locationKey = boothData.locationName || currentLocationName;
  
  if (!acc[locationKey]) {
    acc[locationKey] = {
      locationName: locationKey,
      locationType: boothData.locationType || currentLocationType,
      booths: [],
      totalSqm: 0,
      boothIds: []
    };
  }
  
  acc[locationKey].booths.push({ boothId, ...boothData });
  acc[locationKey].totalSqm += boothData.sqm;
  acc[locationKey].boothIds.push(boothId);
  
  return acc;
}, {} as Record<string, any>);

  const handleRemoveBooth = (e: React.MouseEvent, boothId: string) => {
    e.stopPropagation();
    onRemoveBooth(boothId);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearAll();
  };

  // Check if all selections are valid for enabling the Complete Reservation button
  const allValid = isAllSelectionsValid(groupedSelections);

  return (
    <div className="bg-gray-50 border-2 border-blue-500 rounded-lg p-5 mb-5 shadow-lg">
      <h4 className="text-xl font-semibold text-blue-700 mb-4">
        🛒 Selected Booths Summary
      </h4>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-blue-600 text-white text-xs uppercase">
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Booth IDs</th>
              <th className="p-3 text-left">Total Area</th>
              <th className="p-3 text-left">Package Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedSelections).map(([location, data]) => {
              const packagePrice = calculatePackagePrice(data.totalSqm, data.locationType, data.booths);
              const status = validateMinimumRequirement(data.totalSqm, data.locationType, data.booths);
              
              return (
                <tr key={location} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">{location}</td>
                  <td className="p-3 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {data.boothIds.map((id: string) => (
                        <span key={id} className="inline-flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {id}
                          </span>
                          <button
                            onClick={(e) => handleRemoveBooth(e, id)}
                            className="ml-1 text-red-500 hover:text-red-700"
                            title={`Remove ${id}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{data.totalSqm}m²</td>
                  <td className="p-3 text-sm font-medium">
                    {packagePrice ? `₦${packagePrice.toLocaleString()}` : '---'}
                  </td>
                  <td className="p-3 text-sm">
                    {status.isValid ? (
                      <span className="text-green-600">✓ Valid</span>
                    ) : (
                      <span className="text-red-600">{status.message}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        data.boothIds.forEach((id: string) => onRemoveBooth(id));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Clear Location
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer font-bold text-xs hover:bg-green-700 transition-all duration-200"
        >
          📄 Export CSV
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white border-none rounded cursor-pointer font-bold text-xs hover:bg-teal-700 transition-all duration-200"
        >
          💾 Save JSON
        </button> */}
        {onCompleteReservation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompleteReservation();
            }}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer font-bold text-xs hover:bg-blue-700 transition-all duration-200"
            disabled={!allValid}
          >
            🎫 Complete Reservation
          </button>
        )}
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer font-bold text-xs hover:bg-red-700 transition-all duration-200"
        >
          🗑️ Clear All
        </button>
      </div>
      {Object.entries(groupedSelections).map(([location, data]) => {
  const entitlements = getEntitlements(data.totalSqm, data.locationType, data.booths);
  
  if (!entitlements) return null;
  
  return (
    <div key={`entitlements-${location}`} className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h5 className="text-lg font-semibold text-blue-800 mb-3">
        📋 Package Entitlements - {location} ({data.totalSqm}m²)
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <span className="text-2xl">🚗</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Car Stickers</p>
            <p className="text-xl font-bold text-blue-800">{entitlements.carStickers}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <span className="text-2xl">🎫</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exhibitor Passes</p>
            <p className="text-xl font-bold text-blue-800">{entitlements.passes}</p>
          </div>
        </div>
        
        {entitlements.furniture && (
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">🪑</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Furniture</p>
              <p className="text-sm font-bold text-blue-800">{entitlements.furniture}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Show warning if custom size */}
      {!entitlements && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
          <p className="text-sm text-yellow-800">
            ⚠️ Custom booth size ({data.totalSqm}m²) - Please contact sales for pricing and entitlements
          </p>
        </div>
      )}
    </div>
  );
})}

{/* Grand Total Section */}
{Object.keys(groupedSelections).length > 1 && (
  <div className="mt-6 bg-gray-100 rounded-lg p-4 border border-gray-300">
    <h5 className="text-lg font-semibold text-gray-800 mb-3">
      💰 Grand Total Summary
    </h5>
    <div className="space-y-2">
      {Object.entries(groupedSelections).map(([location, data]) => {
        const price = calculatePackagePrice(data.totalSqm, data.locationType, data.booths);
        return (
          <div key={`total-${location}`} className="flex justify-between">
            <span className="text-gray-600">{location} ({data.totalSqm}m²):</span>
            <span className="font-bold">
              {price ? `₦${price.toLocaleString()}` : 'Custom Pricing'}
            </span>
          </div>
        );
      })}
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between text-lg">
          <span className="font-bold text-gray-800">Total Amount:</span>
          <span className="font-bold text-green-600">
            ₦{Object.entries(groupedSelections)
              .reduce((sum, [_, data]) => {
                const price = calculatePackagePrice(data.totalSqm, data.locationType, data.booths);
                return sum + (price || 0);
              }, 0)
              .toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
// Keep existing components (SelectionSummary, FeedbackMessage, BoothPolygon) unchanged

export default EnhancedUnifiedInteractiveLayout;