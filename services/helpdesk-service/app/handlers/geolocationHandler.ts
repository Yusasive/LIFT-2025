import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

// FR8.1: System shall provide geolocation features for visitors to locate exhibitors
export const getExhibitorLocation = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const exhibitorId = event.pathParameters?.id;
        
        if (!exhibitorId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Exhibitor ID is required' })
            };
        }

        // TODO: Implement database query to get exhibitor location
        // For now, return mock data
        const exhibitorLocation = {
            exhibitorId,
            name: "Sample Exhibitor",
            coordinates: {
                latitude: 6.5244,
                longitude: 3.3792
            },
            booth: "A-101",
            sector: "Technology",
            hall: "Main Hall"
        };

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: exhibitorLocation
            })
        };
    } catch (error) {
        console.error('Error getting exhibitor location:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}).use(jsonBodyParser());

export const findNearbyExhibitors = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = event.body as any;
        const { latitude, longitude, radius = 100 } = body;

        if (!latitude || !longitude) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Latitude and longitude are required' })
            };
        }

        // TODO: Implement geospatial query to find nearby exhibitors
        // For now, return mock data
        const nearbyExhibitors = [
            {
                id: "1",
                name: "Tech Solutions Ltd",
                distance: 45,
                coordinates: { latitude: 6.5240, longitude: 3.3790 },
                booth: "A-101",
                sector: "Technology"
            },
            {
                id: "2", 
                name: "Fashion House",
                distance: 78,
                coordinates: { latitude: 6.5245, longitude: 3.3795 },
                booth: "B-205",
                sector: "Fashion"
            }
        ];

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: {
                    searchLocation: { latitude, longitude },
                    radius,
                    exhibitors: nearbyExhibitors
                }
            })
        };
    } catch (error) {
        console.error('Error finding nearby exhibitors:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}).use(jsonBodyParser());