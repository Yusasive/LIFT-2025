// components/BoothsData/layouts/africaHallConfig.ts

import { LayoutConfig } from '../types/layout.types';

export const africaHallConfig: LayoutConfig = {
  layoutId: 'africa-hall',
  layoutName: 'Africa Hall',
  locationType: 'indoor',
  
  columns: [
    // Column 1: Left Single Column (N001-N016)
    {
      columnId: 'col-1',
      columnType: 'single',
      boothRange: ['N001', 'N002', 'N003', 'N004', 'N005', 'N006', 'N007', 'N008', 'N009', 'N010', 'N011', 'N012', 'N013', 'N014', 'N015', 'N016'],
      numberingOrder: 'ascending',
      isolatedFromOthers: true,
      sectionId: 'left-section'
    },
    
    // Column 2: Middle Double Column - Upper Section (Special 6m² booths)
    {
      columnId: 'col-2-upper',
      columnType: 'double',
      subColumns: ['col-2a-upper', 'col-2b-upper'],
      boothRange: ['S017', 'S018', 'S019', 'S020', 'S021', 'S022', 'S023', 'S024', 'S025', 'S026', 'S027', 'S028', 'S029', 'S030', 'S031', 'S032', 'S033', 'S034', 'S035', 'S036', 'S037', 'S038', 'S039', 'S040', 'S041', 'S042'],
      numberingOrder: 'ascending',
      isolatedFromOthers: false,
      sectionId: 'middle-upper-section'
    },
    
    // Column 3: Right Single Column (N043-N058)
    {
      columnId: 'col-3',
      columnType: 'single',
      boothRange: ['N043', 'N044', 'N045', 'N046', 'N047', 'N048', 'N049', 'N050', 'N051', 'N052', 'N053', 'N054', 'N055', 'N056', 'N057', 'N058'],
      numberingOrder: 'ascending',
      isolatedFromOthers: true,
      sectionId: 'right-section'
    }
  ],
  
  passages: [
    // Vertical Passage 1: Between Column 1 and Column 2
    {
      passageId: 'vertical-passage-1',
      type: 'main-aisle',
      separates: ['col-1', 'col-2-upper'],
      blocksSequential: true,
      coordinates: [[250, 150], [250, 900]], // Approximate vertical line
      description: 'Main aisle between left single column and middle special booths',
      isVisible: true
    },
    
    // Vertical Passage 2: Between Column 2 and Column 3
    {
      passageId: 'vertical-passage-2',
      type: 'main-aisle',
      separates: ['col-2-upper', 'col-3'],
      blocksSequential: true,
      coordinates: [[550, 150], [550, 900]], // Approximate vertical line
      description: 'Main aisle between middle special booths and right single column',
      isVisible: true
    },
    
    // Horizontal Gap: Between upper special booths and empty lower area
    {
      passageId: 'horizontal-gap',
      type: 'corridor',
      separates: ['col-2-upper', 'empty-lower-section'],
      blocksSequential: true,
      coordinates: [[250, 600], [550, 600]], // Approximate horizontal line
      description: 'Gap between special booth area and empty lower section',
      isVisible: true
    },
    
    // Top Door
    {
      passageId: 'top-door',
      type: 'door',
      separates: ['main-area', 'entrance'],
      blocksSequential: true,
      coordinates: [[350, 100], [450, 100]], // Top entrance
      description: 'Top entrance to Africa Hall',
      isVisible: true
    },
    
    // Bottom Door
    {
      passageId: 'bottom-door',
      type: 'door',
      separates: ['main-area', 'entrance'],
      blocksSequential: true,
      coordinates: [[350, 950], [450, 950]], // Bottom entrance
      description: 'Main front entrance to Africa Hall',
      isVisible: true
    }
  ],
  
  specialBooths: [
    // All S-series booths are special 6m² booths
    {
      boothId: 'S017',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S018',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S019',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S020',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S021',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S022',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S023',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S024',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S025',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S026',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S027',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S028',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S029',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S030',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S031',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S032',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S033',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S034',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S035',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S036',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S037',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S038',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S039',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S040',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S041',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    },
    {
      boothId: 'S042',
      treatAsSeparate: false,
      restrictions: ['different-pricing'],
      pricing: {
        overrideStandardPricing: true,
        customSqm: 6,
        customCategory: 'Special'
      }
    }
  ],
  
  sequentialRules: {
    // Define which booths can connect sequentially
    allowedConnections: {
      // Column 1: Only vertical connections within column
      'N001': ['N002'],
      'N002': ['N001', 'N003'],
      'N003': ['N002', 'N004'],
      'N004': ['N003', 'N005'],
      'N005': ['N004', 'N006'],
      'N006': ['N005', 'N007'],
      'N007': ['N006', 'N008'],
      'N008': ['N007', 'N009'],
      'N009': ['N008', 'N010'],
      'N010': ['N009', 'N011'],
      'N011': ['N010', 'N012'],
      'N012': ['N011', 'N013'],
      'N013': ['N012', 'N014'],
      'N014': ['N013', 'N015'],
      'N015': ['N014', 'N016'],
      'N016': ['N015'],
      
      // Special booths: S017-S042 (arranged in pairs, side by side)
      'S017': ['S018', 'S030'], // Can connect to adjacent booth horizontally and below
      'S018': ['S017', 'S019', 'S031'], // Can connect horizontally
      'S019': ['S018', 'S020', 'S032'],
      'S020': ['S019', 'S021', 'S033'],
      'S021': ['S020', 'S022', 'S034'],
      'S022': ['S021', 'S023', 'S035'],
      'S023': ['S022', 'S036'], // Last in row
      'S024': ['S025', 'S037'], // Start of right column
      'S025': ['S024', 'S026', 'S038'],
      'S026': ['S025', 'S027', 'S039'],
      'S027': ['S026', 'S028', 'S040'],
      'S028': ['S027', 'S029', 'S041'],
      'S029': ['S028', 'S042'],
      'S030': ['S017', 'S031'], // Second row
      'S031': ['S018', 'S030', 'S032'],
      'S032': ['S019', 'S031', 'S033'],
      'S033': ['S020', 'S032', 'S034'],
      'S034': ['S021', 'S033', 'S035'],
      'S035': ['S022', 'S034', 'S036'],
      'S036': ['S023', 'S035'],
      'S037': ['S024', 'S038'],
      'S038': ['S025', 'S037', 'S039'],
      'S039': ['S026', 'S038', 'S040'],
      'S040': ['S027', 'S039', 'S041'],
      'S041': ['S028', 'S040', 'S042'],
      'S042': ['S029', 'S041'],
      
      // Column 3: Only vertical connections within column
      'N043': ['N044'],
      'N044': ['N043', 'N045'],
      'N045': ['N044', 'N046'],
      'N046': ['N045', 'N047'],
      'N047': ['N046', 'N048'],
      'N048': ['N047', 'N049'],
      'N049': ['N048', 'N050'],
      'N050': ['N049', 'N051'],
      'N051': ['N050', 'N052'],
      'N052': ['N051', 'N053'],
      'N053': ['N052', 'N054'],
      'N054': ['N053', 'N055'],
      'N055': ['N054', 'N056'],
      'N056': ['N055', 'N057'],
      'N057': ['N056', 'N058'],
      'N058': ['N057']
    },
    
    columnRestrictions: {
      'col-1': { 
        isolatedColumn: true,
        maxContinuousSelection: 16
      },
      'col-2-upper': { 
        isolatedColumn: false,
        maxContinuousSelection: 26 // All special booths
      },
      'col-3': { 
        isolatedColumn: true,
        maxContinuousSelection: 16
      }
    },
    
    globalRules: {
      preventCrossPassageBooking: true,
      allowRowWiseBooking: true, // In special booth area
      allowColumnWiseBooking: true, // In special booth area
      allowMixedBooking: true, // Combination of row and column
      enforceStrictAdjacency: true // Must be immediately adjacent
    }
  },
  
  metadata: {
    totalBooths: 58,
    boothTypes: [
      {
        type: '6m²',
        count: 26,
        boothIds: [
          'S017', 'S018', 'S019', 'S020', 'S021', 'S022', 'S023', 'S024', 'S025', 'S026',
          'S027', 'S028', 'S029', 'S030', 'S031', 'S032', 'S033', 'S034', 'S035', 'S036',
          'S037', 'S038', 'S039', 'S040', 'S041', 'S042'
        ],
        description: 'Special 6m² booths in central area'
      },
      {
        type: '9m²',
        count: 32,
        boothIds: [
          'N001', 'N002', 'N003', 'N004', 'N005', 'N006', 'N007', 'N008', 'N009', 'N010',
          'N011', 'N012', 'N013', 'N014', 'N015', 'N016', 'N043', 'N044', 'N045', 'N046',
          'N047', 'N048', 'N049', 'N050', 'N051', 'N052', 'N053', 'N054', 'N055', 'N056',
          'N057', 'N058'
        ],
        description: 'Standard 9m² booths on sides'
      }
    ],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    validatedBy: 'System',
    notes: [
      'Africa Hall features a unique layout with special 6m² booths in the center',
      'Center area has 26 special booths arranged in a 2x13 grid',
      'Side columns have standard 9m² booths',
      'Lower section of the center area is empty (shown with dotted lines)',
      'Special booths allow both horizontal and vertical connections',
      'Configuration validated against actual Africa Hall layout diagram'
    ]
  }
};