import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

// FR8.4: System shall maintain comprehensive documentation for all features
export const getDocumentation = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const category = event.pathParameters?.category;

        if (!category) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Documentation category is required' })
            };
        }

        // TODO: Retrieve documentation from database or content management system
        // For now, return mock documentation
        const documentationCategories = {
            'getting-started': {
                title: 'Getting Started Guide',
                description: 'Everything you need to know to get started with LITF 2025',
                sections: [
                    {
                        id: 'registration',
                        title: 'Registration Process',
                        content: 'Step-by-step guide to register for the trade fair...',
                        lastUpdated: '2025-05-29T10:00:00Z'
                    },
                    {
                        id: 'venue-info',
                        title: 'Venue Information',
                        content: 'Location, parking, and facility details...',
                        lastUpdated: '2025-05-28T15:30:00Z'
                    }
                ]
            },
            'exhibitor-guide': {
                title: 'Exhibitor Guide',
                description: 'Complete guide for exhibitors',
                sections: [
                    {
                        id: 'booth-setup',
                        title: 'Booth Setup Guidelines',
                        content: 'Guidelines for setting up your exhibition booth...',
                        lastUpdated: '2025-05-27T12:00:00Z'
                    },
                    {
                        id: 'marketing-materials',
                        title: 'Marketing Materials',
                        content: 'Approved marketing materials and branding guidelines...',
                        lastUpdated: '2025-05-26T09:45:00Z'
                    }
                ]
            },
            'visitor-guide': {
                title: 'Visitor Guide',
                description: 'Information for trade fair visitors',
                sections: [
                    {
                        id: 'event-schedule',
                        title: 'Event Schedule',
                        content: 'Daily schedule of events, presentations, and activities...',
                        lastUpdated: '2025-05-29T08:00:00Z'
                    },
                    {
                        id: 'floor-plan',
                        title: 'Floor Plan & Navigation',
                        content: 'Interactive floor plan and navigation tips...',
                        lastUpdated: '2025-05-28T14:20:00Z'
                    }
                ]
            },
            'api-documentation': {
                title: 'API Documentation',
                description: 'Technical documentation for developers',
                sections: [
                    {
                        id: 'authentication',
                        title: 'Authentication',
                        content: 'How to authenticate API requests...',
                        lastUpdated: '2025-05-29T11:30:00Z'
                    },
                    {
                        id: 'endpoints',
                        title: 'API Endpoints',
                        content: 'Complete list of available API endpoints...',
                        lastUpdated: '2025-05-29T12:00:00Z'
                    }
                ]
            }
        };

        const documentation = documentationCategories[category.toLowerCase()];

        if (!documentation) {
            return {
                statusCode: 404,
                body: JSON.stringify({ 
                    error: 'Documentation category not found',
                    availableCategories: Object.keys(documentationCategories)
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: documentation
            })
        };
    } catch (error) {
        console.error('Error getting documentation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}).use(jsonBodyParser());

export const searchDocs = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = event.body as any;
        const { query, category } = body;

        if (!query) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Search query is required' })
            };
        }

        // TODO: Implement full-text search in documentation database
        // For now, return mock search results
        const searchResults = [
            {
                id: 'result_1',
                title: 'Registration Process',
                category: 'getting-started',
                excerpt: 'Step-by-step guide to register for the trade fair. Online registration is available 24/7...',
                relevanceScore: 0.95,
                lastUpdated: '2025-05-29T10:00:00Z'
            },
            {
                id: 'result_2',
                title: 'Booth Setup Guidelines',
                category: 'exhibitor-guide',
                excerpt: 'Guidelines for setting up your exhibition booth. Please ensure all safety requirements...',
                relevanceScore: 0.78,
                lastUpdated: '2025-05-27T12:00:00Z'
            },
            {
                id: 'result_3',
                title: 'Event Schedule',
                category: 'visitor-guide',
                excerpt: 'Daily schedule of events, presentations, and activities. The trade fair opens at 9:00 AM...',
                relevanceScore: 0.65,
                lastUpdated: '2025-05-29T08:00:00Z'
            }
        ];

        // Filter by category if specified
        let filteredResults = searchResults;
        if (category) {
            filteredResults = searchResults.filter(result => 
                result.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Sort by relevance score
        filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: {
                    query,
                    category,
                    totalResults: filteredResults.length,
                    results: filteredResults
                }
            })
        };
    } catch (error) {
        console.error('Error searching documentation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}).use(jsonBodyParser());

// Get all available documentation categories
export const getDocumentationIndex = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // TODO: Get categories from database
        // For now, return static categories
        const categories = [
            {
                id: 'getting-started',
                title: 'Getting Started Guide',
                description: 'Everything you need to know to get started with LITF 2025',
                icon: 'play-circle',
                sectionCount: 4
            },
            {
                id: 'exhibitor-guide',
                title: 'Exhibitor Guide',
                description: 'Complete guide for exhibitors participating in the trade fair',
                icon: 'store',
                sectionCount: 6
            },
            {
                id: 'visitor-guide',
                title: 'Visitor Guide',
                description: 'Information and tips for trade fair visitors',
                icon: 'users',
                sectionCount: 5
            },
            {
                id: 'api-documentation',
                title: 'API Documentation',
                description: 'Technical documentation for developers and integrators',
                icon: 'code',
                sectionCount: 8
            },
            {
                id: 'troubleshooting',
                title: 'Troubleshooting',
                description: 'Common issues and their solutions',
                icon: 'tool',
                sectionCount: 3
            }
        ];

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: {
                    categories,
                    totalCategories: categories.length,
                    lastUpdated: '2025-05-29T12:00:00Z'
                }
            })
        };
    } catch (error) {
        console.error('Error getting documentation index:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}).use(jsonBodyParser());